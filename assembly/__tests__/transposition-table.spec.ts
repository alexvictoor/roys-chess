import { WHITE } from "../bitboard";
import { pseudoLegalMoves } from "../engine";
import { parseFEN } from "../fen-parser";
import {
  ALPHA_SCORE,
  decodeDepthFromEntry,
  decodeMoveFromEntry,
  decodeScoreFromEntry,
  decodeScoreTypeFromEntry,
  TranspositionTable,
} from "../transposition-table";

describe("Transposition table", () => {
  it("should store data", () => {
    // give
    const table = new TranspositionTable(3);
    const board = parseFEN(
      "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1"
    );
    const moves = pseudoLegalMoves(board, WHITE);
    // when
    table.record(board, moves[0], 42, ALPHA_SCORE, 4);
    // then
    const entry = table.getEntry(board);
    expect(decodeMoveFromEntry(entry)).toBe(moves[0]);
    expect(decodeScoreFromEntry(entry)).toBe(42);
    expect(decodeScoreTypeFromEntry(entry)).toBe(ALPHA_SCORE);
    expect(decodeDepthFromEntry(entry)).toBe(4);
  });
});
