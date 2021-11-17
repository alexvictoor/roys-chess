import {
  BitBoard,
  BLACK,
  firstColMask,
  firstRowMask,
  opponent,
  WHITE,
} from "../../bitboard";
import {
  attackByPawnsMask,
  attackMask,
} from "../../evaluation/stockfish-attacks";
import { parseFEN } from "../../fen-parser";

const centralRows =
  (firstColMask << 2) |
  (firstColMask << 3) |
  (firstColMask << 4) |
  (firstColMask << 5);

export function spaceArea(board: BitBoard, player: i8): i16 {
  const firstRowsMask =
    player == WHITE
      ? (firstRowMask << 8) | (firstRowMask << 16) | (firstRowMask << 24)
      : (firstRowMask << 32) | (firstRowMask << 40) | (firstRowMask << 48);
  const pawnMask = board.getPawnMask(player);
  const opponentPlayer = opponent(player);

  const freeSquaresMask =
    centralRows &
    firstRowsMask &
    ~attackByPawnsMask(board, opponentPlayer) &
    ~pawnMask;

  const squaresBehindPawnsMask =
    player == WHITE
      ? (pawnMask >> 8) | (pawnMask >> 16) | (pawnMask >> 24)
      : (pawnMask << 8) | (pawnMask << 16) | (pawnMask << 24);

  const protectedSquaresMask =
    freeSquaresMask &
    squaresBehindPawnsMask &
    ~attackMask(board, opponentPlayer, false);

  return <i16>popcnt(freeSquaresMask) + <i16>popcnt(protectedSquaresMask);
}

describe("Stockfish space area evaluation", () => {
  it("should count safe squares for minor peaces on central files", () => {
    let board = parseFEN(
      "rnbqkbnr/4pppp/p4p2/pP6/4P3/3P4/P3PPPP/RNBQKBNR w KQkq - 0 5"
    );
    expect(spaceArea(board, BLACK)).toBe(<i16>6);
    expect(spaceArea(board, WHITE)).toBe(<i16>10);
  });
});
