import { BitBoard, BLACK, KING, PAWN, QUEEN, ROOK, WHITE } from "../bitboard";
import { parseFEN } from "../fen-parser";
import { evaluateQuiescence } from "../quiescence-evaluation";
import { evaluate } from "../static-evaluation";

describe("Quiescence evaluation", () => {
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

  it("should be great when opponent will be checkmate", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KING, WHITE, 4);
    board.putPiece(KING, BLACK, 56);
    board.putPiece(QUEEN, WHITE, 42);
    board.putPiece(ROOK, BLACK, 49);
    board.putPiece(ROOK, WHITE, 41);
    // when
    const quiescenceEvaluation = evaluateQuiescence(WHITE, board);
    // then
    expect(quiescenceEvaluation).toBe(10000);
  });

  xit("bench", () => {
    const board = parseFEN(
      "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1"
    );
    evaluateQuiescence(WHITE, board);
    //log(board.execute(move).toString());
  });
});
