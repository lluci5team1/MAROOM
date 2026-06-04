# MAROOM

**Swipe right on your perfect space.**

Tinder-style furniture discovery app for college students and young renters furnishing their first space. MAROOM learns your taste from every swipe and ranks a real, purchasable furniture catalog to match it.

🧪 **Now in closed beta:** [Join on TestFlight](https://testflight.apple.com/join/S7aJagxE) (iOS)
🌐 **Landing page:** [`lluci5team1/maroom-landing`](https://github.com/lluci5team1/maroom-landing)

---

## How it works

1. **Catalog** — thousands of real products imported from Google Shopping via SERP API (7 styles × 6 color palettes × room types), each linking to a real retailer
2. **Style quiz** — onboarding captures space type, room size, up to 3 styles, color palette, and budget
3. **Home (swipe deck)** — intentionally *randomized* feed; every left/right swipe is a taste signal. Right swipes auto-save to your Liked list. Double-tap flips the card for specs + Buy Now
4. **Explore** — the AI feed: items ranked by vector similarity to your personal taste profile, with keyword search and brand/category/style/color/price filters
5. **Saved** — everything you liked, organized by room category, one tap to the retailer

## The AI under the hood

- Every furniture item is embedded with **Voyage AI `voyage-multimodal-3.5`** — its photo (70%) + text metadata (30%) become a **1024-dimension vector** stored in **PostgreSQL + pgvector**
- Each user gets a **taste vector** computed from swipe history: right swipes pull it toward an item's style, left swipes push away (0.25 penalty weight)
- Explore = cosine similarity search between your vector and every item's vector, recomputed as you swipe
- Cold start: before you have swipe history, recommendations fall back to preference-based scoring from the onboarding quiz (style +5, color +3, budget +2, room +1)

---

## Tech Stack

**Frontend** — `frontend/`

| | |
|---|---|
| Framework | Expo 54, React Native 0.81.5, React 19 |
| Language | TypeScript |
| Routing | Expo Router (file-based) |
| Animation | react-native-reanimated 4 + gesture-handler (swipe/flip) |
| HTTP | axios (Bearer token interceptor, Railway → localhost fallback) |
| Auth storage | expo-secure-store |
| Sign-in | Email/password + Google OAuth (expo-auth-session) |
| Architecture | Feature-Sliced Design (FSD) |

**Backend** — `backend/`

| | |
|---|---|
| Framework | Spring Boot 4.0.1, Java 17 |
| Database | Supabase PostgreSQL + pgvector |
| Embeddings | Voyage AI (multimodal, 1024-dim) |
| Catalog source | SERP API (Google Shopping) |
| Auth | BCrypt + opaque session tokens; Google ID-token verification |
| Deploy | Railway (`maroom-production.up.railway.app`) |

---

## Getting Started

### Prerequisites

- Node.js + npm
- Expo Go on your phone, or an iOS simulator
- Java 17
- Backend credentials (`.env.local` — ask a backend teammate)

### Frontend

```bash
cd frontend
npm install
npm start        # scan QR with Expo Go
npm run ios      # iOS simulator
```

By default the app talks to the production backend on Railway. To use a local backend, create `frontend/.env.local`:

```
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:8080
```

### Backend

```bash
cd backend
./mvnw spring-boot:run   # port 8080
```

Create `backend/.env.local` (loaded automatically via `spring.config.import`):

```
DB_URL=jdbc:postgresql://...        # Supabase connection
DB_USERNAME=...
DB_PASSWORD=...
GOOGLE_CLIENT_ID=...                # Google OAuth verification
SERPAPI_API_KEY=...                 # catalog imports (optional for dev)
VOYAGE_API_KEY=...                  # embeddings (optional for dev)
MAROOM_EMBEDDINGS_ENABLED=true
```

---

## Project Structure

```
.
├── frontend/                # Expo React Native app
│   └── src/
│       ├── app/             # Expo Router routes (auth flow + main tabs)
│       ├── pages/           # Screens: home, explore, saved, profile, onboarding…
│       ├── widgets/         # Multi-feature UI blocks
│       ├── features/        # Swipe gestures, card flip, filter modal
│       ├── entities/        # Domain types & API functions
│       └── shared/          # API client, config, reusable UI
├── backend/                 # Spring Boot API
│   └── src/main/java/com/maroom/maroom/
│       ├── controller/      # 10 REST controllers
│       ├── service/         # Auth, recommendations, embeddings, SERP import
│       ├── repository/      # Spring Data JPA
│       ├── domain/          # Entities: User, FurnitureItem, SwipeEvent, Preference…
│       └── dto/
├── docs/                    # SERP API guide, API reference PDF, beta survey
└── tools/                   # API-docs PDF generator
```

---

## API Overview

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/signup` | Email/password registration → session token |
| POST | `/auth/login` | Login → token + onboarding status |
| POST | `/auth/google` | Google OAuth (verifies idToken, upserts user) |
| POST | `/auth/logout` | Invalidate session token |

### Feeds & swiping
| Method | Path | Description |
|--------|------|-------------|
| GET | `/swipe/feed/{userId}` | **Home feed** — random unswiped items |
| POST | `/swipe` | Record LEFT/RIGHT swipe; RIGHT auto-saves to Liked |
| DELETE | `/swipe/{userId}/{furnitureId}` | Undo most recent swipe |
| GET | `/recommendations/{userId}` | **Explore feed** — embedding-ranked (preference-scored fallback) |

### Catalog
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/furniture-items` | All items |
| GET | `/api/furniture-items/search` | Search + filters (`q`, brand, category, style, color, price, sort) |
| POST | `/api/furniture/import/large` | Batch import from SERP API (dedup by product URL) |
| POST | `/api/furniture-items/embeddings/backfill` | Generate missing Voyage embeddings |

### User data
| Method | Path | Description |
|--------|------|-------------|
| GET | `/saved/{userId}` | Liked items with furniture details |
| DELETE | `/saved/{userId}/{furnitureId}` | Unsave an item |
| POST / GET | `/preferences` / `/preferences/{userId}` | Save/fetch onboarding quiz |
| GET | `/preferences/options` | Valid quiz options (styles, palettes, budgets…) |
| GET / PATCH | `/users/{id}` | Profile fetch / update (displayName, avatar) |

Full reference: `docs/maroom-backend-api-guide.pdf`

---

## Status & Roadmap

- ✅ iOS closed beta live on TestFlight
- 🔜 Fold in beta tester feedback
- 🔜 Community features (shared collections)
- 🔜 Android build
- 🔜 App Store launch

## Business model

Affiliate commerce — free for users; revenue from retailer commissions on purchases made through the app.

## Team — AI사자 (UCI)

| | |
|---|---|
| Isaac Lee | PM |
| Inha Hwang | Backend |
| Daniel Ho Kim | Backend |
| Hyungjoon Bae | Frontend |
| Yulim Jang | Design |
| Seoyoung Jang | Design |
