import { BitBoard, BLACK, KING, PAWN, QUEEN, WHITE } from "../../fast/bitboard";
import { evaluateQuiescence } from "../../fast/quiescence-evaluation";
import { evaluate } from "../../fast/static-evaluation";

describe(`Quiescence evaluation`, () => {
  it("should be greather than static evaluation when opponent pieces are not protected", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KING, WHITE, 4);
    board.putPiece(KING, BLACK, 60);
    board.putPiece(QUEEN, WHITE, 41);
    board.putPiece(PAWN, BLACK, 50);
    // when
    const quiescenceEvaluation = evaluateQuiescence(BLACK, board);
    // then
    const staticEvaluation = evaluate(BLACK, board);
    expect(quiescenceEvaluation).toBeGreaterThan(staticEvaluation);
  });
});
