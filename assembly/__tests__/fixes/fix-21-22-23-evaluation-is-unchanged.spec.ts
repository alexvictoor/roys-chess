import { BLACK, WHITE } from "../../bitboard";
import { parseFEN } from "../../fen-parser";
import { evaluate } from "../../static-evaluation";

// Fixes 21, 22, 23 (audit E2, E3, E4) are pure speed refactors of the
// Stockfish evaluation port (imbalance, safe checks, mobility tables). These
// values were recorded from the original build and must not move.
const positions: string[] = [
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1",
  "r2q1rk1/pp2bppp/2n1pn2/3p4/3P4/2NBPN2/PP3PPP/R2QK2R w KQ - 0 10",
  "6k1/pp4pp/8/8/8/2n5/PP3QPP/5RK1 w - - 0 1",
  "rn1qk1nr/ppp2ppp/8/3pp3/1b1P4/2N2N2/PPP1PPPP/R2QKB1R w KQkq - 0 5",
  "8/5k2/8/8/8/8/5PK1/8 w - - 0 1",
];
// recorded with the original build (git 6aa0bcd), identical for both colours
const expectedWhite: i16[] = [28, 110, 7, 2521, 72, 71];
const expectedBlack: i16[] = [28, 110, 7, 2521, 72, 71];

describe("Fixes 21-23: the evaluation is bit-identical to the original", () => {
  it("evaluates the reference positions to the recorded values", () => {
    for (let index = 0; index < positions.length; index++) {
      const board = parseFEN(positions[index]);
      expect(evaluate(WHITE, board)).toBe(expectedWhite[index], positions[index] + " (white)");
      expect(evaluate(BLACK, board)).toBe(expectedBlack[index], positions[index] + " (black)");
    }
  });
});
