// The entry file of your WebAssembly module.

import { perft } from "./perft";
import { findAllRookMagicNumbers } from "./magic";

export function add(a: i32, b: i32): i32 {
  return a + b;
}

export const even = (): i32[] => {
  return [1, 2, 3, 4, 5].filter((n) => n % 2 === 0);
};

export function perf(): i32 {
  return perft(3);
}
export function findMagicNumbers(): string {
  return findAllRookMagicNumbers()
    .slice(0)
    .map<string>((m) => "'" + m.toString(16) + "'")
    .join(",");
}
