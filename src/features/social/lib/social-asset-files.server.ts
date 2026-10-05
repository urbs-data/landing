// Server-only: the PNG bytes are inlined into the server bundle at build time
// so they never get a public URL. They're only reachable through the gated
// `/api/social/assets/:key` endpoint.
import linkedinDataUrl from "../assets/linkedin.png?inline";
import meetDataUrl from "../assets/meet.png?inline";
import type { SocialAssetKey } from "./social-assets";

function decodeDataUrl(dataUrl: string) {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

const dataUrls = {
  linkedin: linkedinDataUrl,
  meet: meetDataUrl,
} satisfies Record<SocialAssetKey, string>;

const cache = new Map<SocialAssetKey, Uint8Array<ArrayBuffer>>();

export function getSocialAssetBytes(key: SocialAssetKey) {
  let bytes = cache.get(key);

  if (!bytes) {
    bytes = decodeDataUrl(dataUrls[key]);
    cache.set(key, bytes);
  }

  return bytes;
}
