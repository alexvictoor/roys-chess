import { BitBoard, encodeMove, HASH, ROOK, WHITE } from "../../bitboard";
import {
  decodeScoreFromEntry,
  EXACT_SCORE,
  TranspositionTable,
} from "../../transposition-table";

// Fix 15 (audit S14), part 2: a deeper entry blocked its slot forever, even
// from an earlier search. Entries now carry the search generation and an
// entry from a previous search is always replaceable.
function boardWithHash(hash: u64): BitBoard {
  const board = new BitBoard();
  board.bits[HASH] = hash;
  return board;
}
const move = encodeMove(ROOK + WHITE, 0, ROOK + WHITE, 1);

describe("Fix 15b: replacement policy", () => {
  it("keeps the deeper entry within one search", () => {
    const table = new TranspositionTable(4);
    const deep = boardWithHash(0x1000000000000020);
    const shallow = boardWithHash(0x1000000000000030); // same slot
    table.newSearch();

    table.record(deep, move, 10, EXACT_SCORE, 6);
    table.record(shallow, move, 20, EXACT_SCORE, 2);

    expect(decodeScoreFromEntry(table.getEntry(deep))).toBe(10);
    expect(table.getEntry(shallow)).toBe(0);
  });

  it("lets a new search overwrite a deeper entry of a previous search", () => {
    const table = new TranspositionTable(4);
    const old = boardWithHash(0x1000000000000020);
    const fresh = boardWithHash(0x1000000000000030); // same slot
    table.newSearch();
    table.record(old, move, 10, EXACT_SCORE, 6);

    table.newSearch();
    table.record(fresh, move, 20, EXACT_SCORE, 2);

    expect(decodeScoreFromEntry(table.getEntry(fresh))).toBe(20);
    expect(table.getEntry(old)).toBe(0);
  });
});
