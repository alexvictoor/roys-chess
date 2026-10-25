import {
  BLACK,
  decodeCapturedPiece,
  decodeDestPiece,
  fromUciNotation,
  KNIGHT,
  QUEEN,
  ROOK,
  WHITE,
} from "../../bitboard";
import { parseFEN } from "../../fen-parser";

// Fix 24 (audit B3): fromUciNotation() ignored the promotion suffix, so
// e7e8q produced a pawn move to the last rank.
describe("Fix 24: UCI promotions are parsed", () => {
  it("promotes to a queen", () => {
    const board = parseFEN("8/4P2k/8/8/8/8/8/4K3 w - - 0 1");

    expect(decodeDestPiece(fromUciNotation("e7e8q", board))).toBe(QUEEN + WHITE);
  });

  it("under-promotes to a knight", () => {
    const board = parseFEN("8/4P2k/8/8/8/8/8/4K3 w - - 0 1");

    expect(decodeDestPiece(fromUciNotation("e7e8n", board))).toBe(KNIGHT + WHITE);
  });

  it("promotes while capturing", () => {
    const board = parseFEN("3r3k/4P3/8/8/8/8/8/4K3 w - - 0 1");
    const move = fromUciNotation("e7d8q", board);

    expect(decodeDestPiece(move)).toBe(QUEEN + WHITE);
    expect(decodeCapturedPiece(move)).toBe(ROOK + BLACK);
  });
});
