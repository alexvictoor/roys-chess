import { BitBoard, encodeMove, HASH, ROOK, WHITE } from "../../bitboard";
import {
  decodeScoreFromEntry,
  EXACT_SCORE,
  TranspositionTable,
} from "../../transposition-table";

// Fix 15 (audit S14), part 1: the verification key dropped the 5 low bits of
// the hash, so two positions whose hashes differ only there shared an entry.
function boardWithHash(hash: u64): BitBoard {
  const board = new BitBoard();
  board.bits[HASH] = hash;
  return board;
}
const move = encodeMove(ROOK + WHITE, 0, ROOK + WHITE, 1);

describe("Fix 15a: a probe only hits an entry recorded for the same hash", () => {
  it("does not return the entry of a position whose hash differs in bit 4", () => {
    const table = new TranspositionTable(4); // 16 slots: both hashes land in slot 0
    const recorded = boardWithHash(0x1000000000000020);
    const other = boardWithHash(0x1000000000000030);

    table.record(recorded, move, 42, EXACT_SCORE, 3);

    expect(decodeScoreFromEntry(table.getEntry(recorded))).toBe(42);
    expect(table.getEntry(other)).toBe(0);
  });
});
