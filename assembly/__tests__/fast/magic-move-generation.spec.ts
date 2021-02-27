import {
  bishopAttacks,
  bishopMaskAt,
  maskString,
  rookAttacks,
} from "../../fast/magic";
import {
  rookPseudoLegalMoves,
  bishopPseudoLegalMoves,
} from "../../fast/magic-move-generation";

describe(`Rook magic move generation`, () => {
  it("should get rook moves", () => {
    // given
    const board: u64 = (1 << 2) + (1 << 9);
    const position: i8 = 10;
    // when
    const moves = rookPseudoLegalMoves(board, position);
    // then
    expect(rookPseudoLegalMoves(board, position)).toBe(
      rookAttacks(position, board)
    );
  });
});

describe(`Bishop magic move generation`, () => {
  it("should get bishop moves", () => {
    // given
    const position: i8 = 19;
    const board: u64 = (1 << 26) + (1 << 28);
    // when
    const moves = bishopPseudoLegalMoves(board, position);
    // then
    log(maskString(bishopMaskAt(position)));
    log(maskString(board));
    log(maskString(moves));
    log(maskString(bishopAttacks(position, board)));
    expect(moves).toBe(
      bishopAttacks(position, board)
      //(1 << 1) + (1 << 5) + (1 << 10) + (1 << 12) + (1 << 26) + (1 << 28)
    );
  });
});
