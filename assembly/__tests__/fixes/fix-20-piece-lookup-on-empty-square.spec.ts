import { BLACK, encodePawnDoubleMove, PAWN, WHITE } from "../../bitboard";
import { parseFEN } from "../../fen-parser";

// Fix 20 (audit E1): getPieceAt() scanned the 12 bitboards and threw on an
// empty square. It now reads a mailbox array, which must follow every move.
describe("Fix 20: piece lookup through the mailbox", () => {
  it("returns -1 (no piece) on an empty square instead of throwing", () => {
    const board = parseFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

    expect(board.getPieceAt(20)).toBe(-1);
  });

  it("follows the pieces through do() and undo()", () => {
    const board = parseFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    const e2: i8 = 12;
    const e4: i8 = 28;

    board.do(encodePawnDoubleMove(WHITE, e2, e4));
    expect(board.getPieceAt(e4)).toBe(PAWN + WHITE);
    expect(board.getPieceAt(e2)).toBe(-1);

    board.undo();
    expect(board.getPieceAt(e2)).toBe(PAWN + WHITE);
    expect(board.getPieceAt(e4)).toBe(-1);
    expect(board.getPieceAt(52)).toBe(PAWN + BLACK);
  });
});
