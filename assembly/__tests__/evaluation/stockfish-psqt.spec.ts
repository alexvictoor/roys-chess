import { WHITE } from "../../bitboard";
import { isolated } from "../../evaluation/stockfish-pawn";
import { psqtBonus } from "../../evaluation/stockfish-static-evaluation";
import { parseFEN } from "../../fen-parser";

describe("Stockfish psqt evaluation", () => {
  it("should evaluate piece square table bonuses (pawn)", () => {
    const board = parseFEN(
      "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"
    );
    expect(psqtBonus(board, true)).toBe(24);
  });
  it("should evaluate piece square table bonuses (non pawn)", () => {
    const board = parseFEN(
      "rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq e3 0 1"
    );
    expect(psqtBonus(board, true)).toBe(98);
  });
});
