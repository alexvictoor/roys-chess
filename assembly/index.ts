// The entry file of your WebAssembly module.

import {
  analyseBestMove,
  chooseBestMove,
  getLastSearchDepth,
  getLastSearchScore,
  getTotalNodes,
  reset,
  setSearchFeatures,
  setSearchTimeout,
} from "./alpha-beta-evaluation";
import {
  BitBoard,
  BLACK,
  decodePlayer,
  fromUciNotation,
  opponent,
  toNotation,
  toUciNotation,
  WHITE,
} from "./bitboard";
import { parseFEN } from "./fen-parser";
import { findAllBishopMagicNumbers, findAllRookMagicNumbers } from "./magic";
import { generateOpeningBookData, generateOpeningBookSourceCode } from "./opening-book";
import { perft, perft2 } from "./perft";
import { isCheckMate, isDraw } from "./status";
import { evaluate } from "./static-evaluation";
import { evaluateQuiescence, getQuiescenceNodes } from "./quiescence-evaluation";

export function now(): f64 {
  return <f64>Date.now();
}

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
  const board = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -";

  return <f64>perft2(5, parseFEN(board), BLACK);
}

export function nextMove(fen: string, player: f64): string {
  const board = parseFEN(fen);
  const move = chooseBestMove(<i8>player, board, 10);

  return toNotation(<u32>(move & 0xffffffff)) + " " + (move >> 32).toString();
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
  const numberOfKeysNeeded = 64 * (1 + 1 + 1 + 1 + 1 + 1) * 2 // one key per board square color piece
    + 16  // en passant files
    + 16; // castling rights
  for (let index = 0; index < numberOfKeysNeeded; index++) {
    randomKeys.push(randomU64());
  }
  return randomKeys.join(", ");
}

export class Game {
  board: BitBoard;

  constructor() {
    this.board = parseFEN(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    );
    reset();
  }

  startFrom(fen: string): void {
    this.board = parseFEN(fen);
    reset();
  }

  chooseNextMove(player: f64): string {
    const move = chooseBestMove(<i8>player, this.board, 20);
    this.board.do(<u32>(move & 0xffffffff));
    const nextPlayer = opponent(decodePlayer(<u32>(move & 0xffffffff)));
    const moveCode = toNotation(<u32>(move & 0xffffffff));
    const depth = (move >> 32).toString();
    if (isCheckMate(nextPlayer, this.board)) {
      return '{ "endGame": "BLACK_WINS", "move": "' + moveCode + '" }';
    }
    if (isDraw(nextPlayer, this.board)) {
      return '{ "endGame": "DRAW", "move": "' + moveCode + '" }';
    }
    return '{ "move": "' + moveCode + '", "depth": ' + depth + " }";
  }

  analyse(): string {
    return analyseBestMove(this.board, 12)
      .map<string>((m) => toNotation(m))
      .join(" ");
  }

  performMove(move: f64): string {
    this.board.do(<u32>move);
    const nextPlayer = opponent(decodePlayer(<u32>move));
    if (isCheckMate(nextPlayer, this.board)) {
      return "CHECK_MATE";
    }
    if (isDraw(nextPlayer, this.board)) {
      return "DRAW";
    }
    return this.board.toFEN();
  }

  undo(): string {
    this.board.undo();
    return this.board.toFEN();
  }
}


export function generateOpeningBook(data: string): string {
  const openingBookData = generateOpeningBookData(data);
  return generateOpeningBookSourceCode(openingBookData);
}
// ---------------------------------------------------------------------------
// Benchmark / evaluation hooks (used by the bench/ harness)
// ---------------------------------------------------------------------------

function searchResultJson(move: u32, elapsedMs: i64): string {
  return (
    '{ "uci": "' + toUciNotation(move) +
    '", "move": "' + toNotation(move) +
    '", "depth": ' + getLastSearchDepth().toString() +
    ', "score": ' + getLastSearchScore().toString() +
    ', "nodes": ' + getTotalNodes().toString() +
    ', "qnodes": ' + getQuiescenceNodes().toString() +
    ', "timeMs": ' + elapsedMs.toString() +
    " }"
  );
}

/** Search a FEN position; returns a JSON string describing the chosen move. */
export function searchFen(fen: string, maxDepth: i32, timeoutMs: i32): string {
  const board = parseFEN(fen);
  reset();
  setSearchTimeout(<i64>timeoutMs);
  const start = Date.now();
  const move = chooseBestMove(board.currentPlayer, board, <i8>maxDepth);
  const elapsed = Date.now() - start;
  return searchResultJson(<u32>(move & 0xffffffff), elapsed);
}

export function perftFen(fen: string, depth: i32): f64 {
  const board = parseFEN(fen);
  return <f64>perft2(<i8>depth, board, board.currentPlayer);
}

/** Static evaluation from the side to move point of view (centipawns-ish). */
export function evaluateFen(fen: string): i32 {
  const board = parseFEN(fen);
  return <i32>evaluate(board.currentPlayer, board);
}

export class BenchGame {
  board: BitBoard;

  constructor(fen: string) {
    this.board = parseFEN(fen);
    reset();
  }

  /** Let the engine think for the side to move; returns JSON (see searchResultJson). */
  think(maxDepth: i32, timeoutMs: i32): string {
    setSearchTimeout(<i64>timeoutMs);
    const start = Date.now();
    const move = chooseBestMove(this.board.currentPlayer, this.board, <i8>maxDepth);
    const elapsed = Date.now() - start;
    return searchResultJson(<u32>(move & 0xffffffff), elapsed);
  }

  /** Apply a UCI move (e.g. e2e4, e7e8q). */
  play(uci: string): void {
    this.board.do(fromUciNotation(uci, this.board));
  }

  /** "" while the game is running, "CHECK_MATE" or "DRAW" once it is over. */
  status(): string {
    const player = this.board.currentPlayer;
    if (isCheckMate(player, this.board)) {
      return "CHECK_MATE";
    }
    if (isDraw(player, this.board)) {
      return "DRAW";
    }
    return "";
  }

  fen(): string {
    return this.board.toFEN();
  }
}

/** Bench hook: enable/disable search features (see setSearchFeatures). */
export function configureSearch(featureMask: i32): void {
  setSearchFeatures(featureMask);
}

/** Bench hook: principal variation of the last search on a FEN (from the transposition table). */
export function principalVariation(fen: string, maxDepth: i32): string {
  const board = parseFEN(fen);
  return analyseBestMove(board, <i8>maxDepth)
    .map<string>((m) => toUciNotation(m))
    .join(" ");
}

/** Bench hook: quiescence score of a FEN from the side to move point of view. */
export function quiescenceFen(fen: string): i32 {
  const board = parseFEN(fen);
  return <i32>evaluateQuiescence(board.currentPlayer, board);
}
