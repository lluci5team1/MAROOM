/**
 * URIs safe to pass to react-native `<Image source={{ uri }}>` on iOS Release.
 * RCTImageLoader throws NSException for empty, malformed, or oversized data: URIs;
 * RN then crashes in Hermes while converting that native exception (TurboModule).
 */

/** Local picks and remote URLs only — safe for on-screen preview. */
export function safeImageUri(url: string | undefined | null): string | null {
  if (!url || url.length === 0) return null;
  if (url.startsWith("file://")) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return null;
}

/** Profile avatar from the API — never render stored base64; it crashes Release builds. */
export function safeProfileAvatarUrl(url: string | undefined | null): string | null {
  if (!url || url.length === 0) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return null;
}

/** Cap base64 payload size before PATCH — huge strings OOM Hermes during JSON.stringify. */
export function safeProfilePicturePayload(
  dataUri: string | undefined | null,
  maxChars = 80_000,
): string | undefined {
  if (!dataUri || !dataUri.startsWith("data:")) return undefined;
  if (dataUri.length > maxChars) return undefined;
  return dataUri;
}
