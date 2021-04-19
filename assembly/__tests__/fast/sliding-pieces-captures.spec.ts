import {
  BISHOP,
  BitBoard,
  BLACK,
  KNIGHT,
  QUEEN,
  ROOK,
  WHITE,
} from "../../fast/bitboard";
import {
  addBishopPseudoLegalCaptures,
  addQueenPseudoLegalCaptures,
  addRookPseudoLegalCaptures,
} from "../../fast/sliding-pieces-move-generation";

describe("Rook captures", () => {
  it("should get rook captures", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KNIGHT, BLACK, 8);
    board.putPiece(ROOK, WHITE, 0);
    board.putPiece(KNIGHT, WHITE, 3);
    // when
    const captures: u64[] = [];
    addRookPseudoLegalCaptures(captures, board, WHITE);
    // then
    expect(captures).toHaveLength(1);
    expect(board.execute(captures[0]).getKnightMask(BLACK)).toBe(0);
  });
});

describe("Bishop captures", () => {
  it("should get bishop captures", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KNIGHT, BLACK, 54);
    board.putPiece(BISHOP, WHITE, 36);
    board.putPiece(KNIGHT, WHITE, 43);
    // when
    const captures: u64[] = [];
    addBishopPseudoLegalCaptures(captures, board, WHITE);
    // then
    expect(captures).toHaveLength(1);
    expect(board.execute(captures[0]).getKnightMask(BLACK)).toBe(0);
  });
});

describe("Queen captures", () => {
  it("should get queen captures in diagonals", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KNIGHT, BLACK, 54);
    board.putPiece(QUEEN, WHITE, 36);
    board.putPiece(KNIGHT, WHITE, 43);
    // when
    const captures: u64[] = [];
    addQueenPseudoLegalCaptures(captures, board, WHITE);
    // then
    expect(captures).toHaveLength(1);
    expect(board.execute(captures[0]).getKnightMask(BLACK)).toBe(0);
  });
});
