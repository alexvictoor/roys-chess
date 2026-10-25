import {
  chooseBestMove,
  getLastSearchScore,
  MATE_BOUND,
  reset,
  setSearchFeatures,
} from "../../alpha-beta-evaluation";
import { WHITE } from "../../bitboard";
import { parseFEN } from "../../fen-parser";

// Fix 8: the search is extended by one ply when the side to move is in
// check, so a forcing sequence of checks is seen earlier.
const ALL_FEATURES = 63;
const CHECK_EXTENSION = 8;
// Philidor's legacy: 1.Nf7+ Kg8 2.Nh6+ Kh8 3.Qg8+ Rxg8 4.Nf7#, seven plies,
// three of them checks that the extension pays for.
const fen = "4r2k/6pp/8/q3N3/2Q5/8/8/7K w - - 0 1";

function scoreAtDepth4(mask: i32): i16 {
  setSearchFeatures(mask);
  reset();
  chooseBestMove(WHITE, parseFEN(fen), 4);
  setSearchFeatures(ALL_FEATURES);
  return getLastSearchScore();
}

describe("Fix 8: the check extension sees a mate through forcing checks", () => {
  it("finds the smothered mate at depth 4 with the extension only", () => {
    expect(scoreAtDepth4(ALL_FEATURES & ~CHECK_EXTENSION)).toBeLessThan(MATE_BOUND);
    expect(scoreAtDepth4(ALL_FEATURES)).toBeGreaterThan(MATE_BOUND);
  });
});
