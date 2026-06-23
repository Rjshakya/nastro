import { Effect } from "effect";
import { nanoid } from "nanoid";
import { v7 } from "uuid";

export const API_KEY_PREFIX = "nas";

export const generateApiKey = (): Effect.Effect<{
  keyId: string;
  rawKey: string;
  keyHash: string;
}> => {
  return Effect.gen(function* () {
    const keyId = v7();
    const keyPart = nanoid(32);
    const rawKey = `${API_KEY_PREFIX}_${keyPart}`;
    const keyHash = yield* hashApiKey(rawKey);

    return {
      keyId,
      rawKey,
      keyHash,
    };
  });
};

export const hashApiKey = (rawKey: string): Effect.Effect<string> => {
  return Effect.tryPromise({
    try: async () => {
      const encoder = new TextEncoder();
      const data = encoder.encode(rawKey);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    },
    catch: (e) => {
      throw new Error(`Failed to hash API key: ${String(e)}`);
    },
  });
};

export const validateApiKeyFormat = (rawKey: string): boolean => {
  if (!rawKey.startsWith(`${API_KEY_PREFIX}_`)) {
    return false;
  }
  const keyPart = rawKey.slice(API_KEY_PREFIX.length + 1);
  return keyPart.length === 32;
};
