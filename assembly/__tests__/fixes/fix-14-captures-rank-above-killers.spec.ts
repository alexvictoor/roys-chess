import {
  BLACK,
  encodeCapture,
  encodeMove,
  KING,
  KNIGHT,
  PAWN,
  WHITE,
} from "../../bitboard";
import { parseFEN } from "../../fen-parser";
import { history } from "../../history";
import { score } from "../../move-ordering";

// Fix 14: capture scores ranged from -900 to +900 while killers scored 16383,
// so every capture was tried after the killer moves. Captures now sit on
// their own scale above every quiet move.
describe("Fix 14: move ordering scales do not overlap", () => {
  it("tries a losing capture before a killer move", () => {
    // Nc3xd5 loses a knight for a pawn (d5 is defended by e6)
    const board = parseFEN("4k3/8/4p3/3p4/8/2N5/8/4K3 w - - 0 1");
    const losingCapture = encodeCapture(KNIGHT + WHITE, 18, KNIGHT + WHITE, 35, PAWN + BLACK);
    const killer = encodeMove(KING + WHITE, 4, KING + WHITE, 3);
    history.resetHistory();
    history.recordCutOffMove(WHITE, 0, 4, killer);

    expect(score(board, WHITE, 0, losingCapture, 0)).toBeGreaterThan(
      score(board, WHITE, 0, killer, 0)
    );
  });
});
