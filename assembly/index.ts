// The entry file of your WebAssembly module.

import { chooseBestMove } from "./fast/alpha-beta-evaluation";
import { BLACK, toNotation, WHITE } from "./fast/bitboard";
import { parseFEN } from "./fast/fen-parser";
import {
  findAllBishopMagicNumbers,
  findAllRookMagicNumbers,
} from "./fast/magic";
import { perft, perft2 } from "./fast/perft";

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
export function benchPerftOptimized(): f64 {
  const board = "r3k2r/pb3p2/5npp/n2p4/1p1PPB2/6P1/P2N1PBP/R3K2R b KQkq -";

  return <f64>perft2(4, parseFEN(board), BLACK);
}

export function nextMove(fen: string, player: f64): string {
  const board = parseFEN(fen);
  const move = chooseBestMove(<i8>player, board, 7);

  return toNotation(move);
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

function randomU64(): u64 {
  return <u64>(Math.random() * Math.random() * <f64>u64.MAX_VALUE);
}

export function generateZobristKeys(): string {
  const randomKeys: u64[] = [];
  const numberOfKeysNeeded = 64 * (1 + 1 + 1 + 1 + 1 + 1) * 2; // one key per board square color piece
  for (let index = 0; index < numberOfKeysNeeded; index++) {
    randomKeys.push(randomU64());
  }
  return randomKeys.join(", ");
}
