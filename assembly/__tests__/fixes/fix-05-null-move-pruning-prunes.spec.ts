import {
  chooseBestMove,
  getTotalNodes,
  reset,
  setSearchFeatures,
} from "../../alpha-beta-evaluation";
import { WHITE } from "../../bitboard";
import { parseFEN } from "../../fen-parser";

// Fix 05: null move pruning was inoperative in the original search (see the doc).
// With the fix, switching it on must make the depth-5 tree smaller.
const ALL_FEATURES = 63;
const FEATURE_BIT = 1;
const fen = "r2q1rk1/pp2bppp/2n1pn2/3p4/3P4/2NBPN2/PP3PPP/R2QK2R w KQ - 0 10";

function nodesWithFeatures(mask: i32): u64 {
  setSearchFeatures(mask);
  reset();
  chooseBestMove(WHITE, parseFEN(fen), 5);
  return getTotalNodes();
}

describe("Fix 05: null move pruning cuts the tree", () => {
  it("searches fewer nodes with the feature than without", () => {
    const without = nodesWithFeatures(ALL_FEATURES & ~FEATURE_BIT);
    const withFeature = nodesWithFeatures(ALL_FEATURES);
    setSearchFeatures(ALL_FEATURES);

    expect(withFeature).toBeGreaterThan(0);
    expect(withFeature).toBeLessThan(without);
  });
});
