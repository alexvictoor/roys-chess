import { BLACK, WHITE } from "../../bitboard";
import { blockersForKingMask } from "../../evaluation/stockfish-blocker-king";
import { parseFEN } from "../../fen-parser";

describe("Stockfish blocker king evaluation", () => {
  
  it("should evaluate blockers for kings", () => {
    const board = parseFEN(
      "2n1k1n1/5ppp/P1qBp1N1/pQP1p3/3b4/1Nn2P2/PB3PPP/3R1RK1 w kq - 16 14"
    );
    expect(blockersForKingMask(board, WHITE)).toBe(1 << 42);
    expect(blockersForKingMask(board, BLACK)).toBe(1 << 13);
  });

  it("should evaluate blockers for kings bis", () => {
    const board = parseFEN(
      "1Rq1k1n1/n4ppp/P5N1/prPpp3/3b2B1/1Nn2P2/PBQ2PPP/5RK1 b kq - 19 15"
    );

    expect(blockersForKingMask(board, WHITE)).toBe(1 << 58);
  });
  it("should evaluate blockers for kings ter", () => {
    const board = parseFEN(
      "2q1k1n1/nR3Npp/P4pB1/prPp4/3bp3/1Nn2P2/PBQ2PPP/5RK1 b kq - 1 16"
    );
    expect<u64>(blockersForKingMask(board, WHITE)).toBe(1 << 53);
  });

});
