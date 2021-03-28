// The entry file of your WebAssembly module.

import { BLACK, WHITE } from "./fast/bitboard";
import { parseFEN } from "./fast/fen-parser";
import {
  findAllBishopMagicNumbers,
  findAllRookMagicNumbers,
} from "./fast/magic";
import { perft } from "./fast/perft";

export function add(a: i32, b: i32): i32 {
  return a + b;
}

export const even = (): i32[] => {
  return [1, 2, 3, 4, 5].filter((n) => n % 2 === 0);
};

export function benchPerft2(): f64 {
  const board =
    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1";

  return <f64>perft(4, parseFEN(board), WHITE);
}
export function benchPerft(): f64 {
  const board = "r3k2r/pb3p2/5npp/n2p4/1p1PPB2/6P1/P2N1PBP/R3K2R b KQkq -";

  return <f64>perft(4, parseFEN(board), BLACK);
}
export function findRookMagicNumbers(): string {
  return findAllRookMagicNumbers()
    .slice(0)
    .map<string>((m) => "0x" + m.toString(16))
    .join(", ");
}
export function findBishopMagicNumbers(): string {
  return findAllBishopMagicNumbers()
    .slice(0)
    .map<string>((m) => "0x" + m.toString(16))
    .join(", ");
}
