import {
  BISHOP,
  BitBoard,
  BLACK,
  KNIGHT,
  QUEEN,
  ROOK,
  WHITE,
} from "../bitboard";
import { MoveStack } from "../move-stack";
import {
  addBishopPseudoLegalCaptures,
  addQueenPseudoLegalCaptures,
  addRookPseudoLegalCaptures,
} from "../sliding-pieces-move-generation";

describe("Rook captures", () => {
  it("should get rook captures", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KNIGHT, BLACK, 8);
    board.putPiece(ROOK, WHITE, 0);
    board.putPiece(KNIGHT, WHITE, 3);
    // when
    const moveStack = new MoveStack();
    addRookPseudoLegalCaptures(moveStack, board, WHITE);
    const captures = moveStack.flush();
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
    const moveStack = new MoveStack();
    addBishopPseudoLegalCaptures(moveStack, board, WHITE);
    const captures = moveStack.flush();
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
    const moveStack = new MoveStack();
    addQueenPseudoLegalCaptures(moveStack, board, WHITE);
    const captures = moveStack.flush();
    // then
    expect(captures).toHaveLength(1);
    expect(board.execute(captures[0]).getKnightMask(BLACK)).toBe(0);
  });
});
