import {
  BISHOP,
  BitBoard,
  BLACK,
  encodeCapture,
  KING,
  PAWN,
  QUEEN,
  WHITE,
} from "../../fast/bitboard";
import { parseFEN } from "../../fast/fen-parser";
import {
  compareCaptures_MVV_LVA,
  evaluateQuiescence,
} from "../../fast/quiescence-evaluation";
import { evaluate } from "../../fast/static-evaluation";

describe('"Most valuable victim, least valuable attacker" capture comparison', () => {
  xit("should compare captures", () => {
    const lowValueCaptureAction = encodeCapture(
      BISHOP + WHITE,
      8,
      BISHOP + WHITE,
      1,
      BISHOP + BLACK,
      1
    );
    const highValueCaptureAction = encodeCapture(
      BISHOP + WHITE,
      8,
      BISHOP + WHITE,
      1,
      QUEEN + BLACK,
      1
    );
    expect(
      compareCaptures_MVV_LVA(lowValueCaptureAction, highValueCaptureAction)
    ).toBeGreaterThan(0);
  });
});

describe(`Quiescence evaluation`, () => {
  xit("should be greather than static evaluation when opponent pieces are not protected", () => {
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

  it("xxx", () => {
    const board = parseFEN(
      "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1"
    );
    evaluateQuiescence(WHITE, board);
    //log(board.execute(move).toString());
  });
});
