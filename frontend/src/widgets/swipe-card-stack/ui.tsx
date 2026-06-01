// widgets/swipe-card-deck/ui/SwipeCardDeck.tsx
import { View, StyleSheet, Text } from "react-native";
import { s, vs, ms } from "../../shared/utils/scale";
import { useEffect, useRef, useState } from "react";
import { useSharedValue, SharedValue } from "react-native-reanimated";
import { Product } from "../../entities/product/type";
import { ProductCard } from "../../shared/ui/ProductCard";
import { SwipeableCard } from "../../features/main-page/swipeable-card/swipeableCard";
import { ProductCardBack } from "../../shared/ui/ProductCardBack";
import { RoundButton } from "../../shared/ui/likeButton";
import { icons } from "../../shared/assets/icons";
import { swipeProduct } from "../../entities/product/api";
import { invalidateSavedCache } from "../../pages/04_saved/ui";

type Props = {
  products: Product[];
  userId: string | null;
  onLoadMore?: () => Promise<Product[]>;
  onAfterSwipe?: () => void;
  goBackRef?: { current: () => void };
};

let _cachedData: Product[] = [];
let _cachedIndex: number = 0;
let _cachedSeenIds: Set<string> = new Set();

type SwipeActions = {
  left?: () => void;
  right?: () => void;
  translateX: SharedValue<number>;
};

export function SwipeCardDeck({ products, userId, onLoadMore, onAfterSwipe, goBackRef }: Props) {
  const [data, setData] = useState<Product[]>(
    _cachedData.length > 0 ? _cachedData : [...products]
  );
  const [currentIndex, setCurrentIndex] = useState(_cachedIndex);
  const animatedValues = useSharedValue(0);
  const [swipeActions, setSwipeActions] = useState<SwipeActions | null>(null);
  const [activePress, setActivePress] = useState<"like" | "dislike" | null>(null);
  const [exhausted, setExhausted] = useState(false);
  const loadingMore = useRef(false);
  const initialized = useRef(_cachedData.length > 0);
  const seenIds = useRef<Set<string>>(
    _cachedSeenIds.size > 0 ? new Set(_cachedSeenIds) : new Set(products.map((p) => p.id))
  );
  const ACTIVE_PRESS_MS = 420;
  const SWIPE_TRIGGER_DELAY_MS = 130;

  const MAX = 4;
  const LOAD_MORE_THRESHOLD = 8;

  // Expose go-back via ref so HomePage can call it
  useEffect(() => {
    if (!goBackRef) return;
    goBackRef.current = () => {
      if (currentIndex === 0) return;
      const prevIndex = currentIndex - 1;
      const prevItem = data[prevIndex];
      if (prevItem?.id) {
        seenIds.current.delete(prevItem.id);
        _cachedSeenIds = new Set(seenIds.current);
      }
      setCurrentIndex(prevIndex);
      _cachedIndex = prevIndex;
      animatedValues.value = prevIndex;
    };
  }, [currentIndex, data, goBackRef]);

  useEffect(() => {
    if (!initialized.current && products.length > 0) {
      setData([...products]);
      seenIds.current = new Set(products.map((p) => p.id));
      _cachedData = [...products];
      _cachedSeenIds = new Set(products.map((p) => p.id));
      _cachedIndex = 0;
      initialized.current = true;
    }
  }, [products]);

  // Self-heal: if we mount (or finish a swipe) with no renderable cards,
  // try to fetch more. This covers the case where the user previously
  // swiped through everything cached and came back to the home tab — the
  // card area would otherwise stay blank forever because handleSwiped
  // (the only existing load-more trigger) requires a swipe to fire.
  useEffect(() => {
    if (!onLoadMore) return;
    if (loadingMore.current) return;
    if (data.length > currentIndex) {
      if (exhausted) setExhausted(false);
      return;
    }
    loadingMore.current = true;
    onLoadMore()
      .then((more) => {
        const uniqueMore = more.filter((p) => {
          if (seenIds.current.has(p.id)) return false;
          seenIds.current.add(p.id);
          return true;
        });
        if (uniqueMore.length > 0) {
          _cachedSeenIds = new Set(seenIds.current);
          setData((prev) => {
            const updated = [...prev, ...uniqueMore];
            _cachedData = updated;
            return updated;
          });
          setExhausted(false);
        } else {
          setExhausted(true);
        }
      })
      .catch(() => setExhausted(true))
      .finally(() => {
        loadingMore.current = false;
      });
  }, [currentIndex, data.length, onLoadMore]);

  const handleSwiped = (direction: "LEFT" | "RIGHT", item: Product) => {
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    _cachedIndex = nextIndex;
    seenIds.current.add(item.id);
    _cachedSeenIds = new Set(seenIds.current);
    if (direction === "LEFT") onAfterSwipe?.();

    // The backend /swipe endpoint already saves the item to the "Liked" list
    // when direction === "RIGHT" (and dedupes via existsBySavedListIdAndFurnitureId).
    // We only need to fire the swipe and invalidate the saved-page cache so it
    // refetches the fresh list next time the user opens it.
    const swipeRequest = userId
      ? swipeProduct(userId, item.id, direction).catch(() => {})
      : Promise.resolve();

    if (userId && direction === "RIGHT") {
      invalidateSavedCache();
    }

    if (onLoadMore && !loadingMore.current && data.length - nextIndex <= LOAD_MORE_THRESHOLD) {
      loadingMore.current = true;
      swipeRequest
        .then(() => onLoadMore())
        .then((more) => {
          if (more.length > 0) {
            const uniqueMore = more.filter((product) => {
              if (seenIds.current.has(product.id)) {
                return false;
              }

              seenIds.current.add(product.id);
              return true;
            });

            if (uniqueMore.length > 0) {
              setData((prev) => {
                const updated = [...prev, ...uniqueMore];
                _cachedData = updated;
                return updated;
              });
            }
          }
        })
        .finally(() => { loadingMore.current = false; });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardArea}>
        {currentIndex < data.length ? (
          data.map((item, index) => {
            if (index < currentIndex || index > currentIndex + MAX) return null;

            return (
              <SwipeableCard
                key={index}
                index={index}
                currentIndex={currentIndex}
                animatedValues={animatedValues}
                maxVisibleItem={MAX}
                dataLength={data.length}
                registerActions={(actions) => {
                  setSwipeActions(actions);
                }}
                onSwiped={(direction) => handleSwiped(direction, item)}
                front={<ProductCard product={item} />}
                back={<ProductCardBack product={item} />}
              />
            );
          })
        ) : (
          <View style={styles.empty}>
            {exhausted ? (
              <>
                <Text style={styles.emptyTitle}>You're all caught up!</Text>
                <Text style={styles.emptySubtitle}>
                  No more items to swipe right now. Check back later.
                </Text>
              </>
            ) : (
              <Text style={styles.emptyTitle}>Loading more items…</Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <RoundButton
          icon={icons.X}
          variant="dislike"
          isActive={activePress === "dislike"}
          translateX={swipeActions?.translateX}
          onPress={() => {
            setActivePress("dislike");
            setTimeout(() => {
              swipeActions?.left?.();
            }, SWIPE_TRIGGER_DELAY_MS);
            setTimeout(() => setActivePress(null), ACTIVE_PRESS_MS);
          }}
        />

        <RoundButton
          icon={icons.heart}
          variant="like"
          isActive={activePress === "like"}
          translateX={swipeActions?.translateX}
          onPress={() => {
            setActivePress("like");
            setTimeout(() => {
              swipeActions?.right?.();
            }, SWIPE_TRIGGER_DELAY_MS);
            setTimeout(() => setActivePress(null), ACTIVE_PRESS_MS);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  cardArea: {
    height: vs(30) + s(460),
    width: "100%",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: s(24),
  },
  emptyTitle: {
    fontSize: ms(18),
    color: "#2C84C6",
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
    marginBottom: vs(8),
  },
  emptySubtitle: {
    fontSize: ms(14),
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: ms(20),
  },
  actions: {
    flex: 1,
    paddingTop: vs(10),
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: s(32),
  },
});
