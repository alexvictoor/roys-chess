import {
  BISHOP,
  BitBoard,
  BLACK,
  encodeCapture,
  encodeMove,
  encodePawnDoubleMove,
  KING,
  KNIGHT,
  PAWN,
  QUEEN,
  ROOK,
  WHITE,
} from "../bitboard";
import { MoveStack } from "../move-stack";
import { addPawnPseudoLegalCaptures, addPawnPseudoLegalMoves } from "../pawn";

describe("Move stack", () => {
  it("should give back all stacked moves", () => {
    // given
    const stack = new MoveStack();
    stack.push(12);
    stack.push(1);
    stack.push(42);
    // when
    const moves = stack.flush();
    // then
    expect(moves).toHaveLength(3);
  });

});
