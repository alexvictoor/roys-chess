import {
  BISHOP,
  BLACK,
  encodeCapture,
  PAWN,
  ROOK,
  WHITE,
} from "../../bitboard";
import { parseFEN } from "../../fen-parser";
import { staticExchangeEvaluation } from "../../static-exchange-evaluation";

// Fix 10 (audit S11): the swap-off value used piece *codes* (0..11) instead
// of piece values for every recapture, and expected the move to be played
// already. SEE is now computed on the board before the move.
describe("Fix 10: static exchange evaluation uses piece values", () => {
  // white Rd1 and Bb3 both attack the d5 pawn, defended by the f6 knight
  const fen = "6k1/8/5n2/3p4/8/1B6/8/3R2K1 w - - 0 1";
  const d1: i8 = 3;
  const b3: i8 = 17;
  const d5: i8 = 35;

  it("values an undefended pawn capture at exactly one pawn", () => {
    const board = parseFEN("6k1/8/8/3p4/8/8/8/3R2K1 w - - 0 1");
    const rookTakesPawn = encodeCapture(ROOK + WHITE, d1, ROOK + WHITE, d5, PAWN + BLACK);

    expect(staticExchangeEvaluation(board, WHITE, rookTakesPawn)).toBe(100);
  });

  it("sees that taking first with the rook loses material", () => {
    const board = parseFEN(fen);
    const rookTakesPawn = encodeCapture(ROOK + WHITE, d1, ROOK + WHITE, d5, PAWN + BLACK);

    // Rxd5 Nxd5 Bxd5: +100 -500 +320
    expect(staticExchangeEvaluation(board, WHITE, rookTakesPawn)).toBe(-80);
  });

  it("sees that taking first with the bishop wins a pawn", () => {
    const board = parseFEN(fen);
    const bishopTakesPawn = encodeCapture(BISHOP + WHITE, b3, BISHOP + WHITE, d5, PAWN + BLACK);

    // Bxd5 Nxd5 Rxd5: +100 -330 +320
    expect(staticExchangeEvaluation(board, WHITE, bishopTakesPawn)).toBe(90);
  });
});
