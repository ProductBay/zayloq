import { hash as argonHash } from "argon2";

// Generated once per process; used only to equalize the expensive verification path.
let dummyHashPromise: Promise<string> | undefined;
export function getDummyPasswordHash(): Promise<string> {
  dummyHashPromise ??= argonHash("zayloq-dummy-password-not-a-credential", { type: 2, memoryCost: 65_536, timeCost: 3, parallelism: 1 });
  return dummyHashPromise;
}
