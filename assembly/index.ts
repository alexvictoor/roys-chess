// The entry file of your WebAssembly module.

import { analyseBestMove, chooseBestMove, reset } from "./alpha-beta-evaluation";
import {
  BitBoard,
  BLACK,
  decodePlayer,
  opponent,
  toNotation,
  WHITE,
} from "./bitboard";
import { parseFEN } from "./fen-parser";
import { findAllBishopMagicNumbers, findAllRookMagicNumbers } from "./magic";
import { generateOpeningBookData, generateOpeningBookSourceCode } from "./opening-book";
import { perft, perft2 } from "./perft";
import { isCheckMate, isDraw } from "./status";

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
    trace('coucou alex')
    this.board.do(<u32>move);
    const nextPlayer = opponent(decodePlayer(<u32>move));
    if (isCheckMate(nextPlayer, this.board)) {
      return "CHECK_MATE";
    }
    if (isDraw(nextPlayer, this.board)) {
      return "DRAW";
    }
    trace('coucou alex 2')
    trace(this.board.toFEN())
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