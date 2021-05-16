import { maskString, WHITE } from "../bitboard";
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
    table.record(board, moves[0], 42, ALPHA_SCORE, 1);
    // then
    const entry = table.getEntry(board);
    expect(decodeMoveFromEntry(entry)).toBe(moves[0]);
    expect(decodeScoreFromEntry(entry)).toBe(42);
    expect(decodeScoreTypeFromEntry(entry)).toBe(ALPHA_SCORE);
    expect(decodeDepthFromEntry(entry)).toBe(1);
  });

  it("should store data (bis)", () => {
    // given
    const table = new TranspositionTable(3);
    const board = parseFEN("4k1r1/p4p2/6pp/4n3/4B3/6P1/P3KP1P/7R w KQkq - 0 1");
    // when
    table.record(board, 847819, -10, ALPHA_SCORE, 4);
    // then
    const entry = table.getEntry(board);
    expect(decodeScoreFromEntry(entry)).toBe(-10);
    expect(decodeScoreTypeFromEntry(entry)).toBe(ALPHA_SCORE);
    expect(decodeDepthFromEntry(entry)).toBe(4);
  });

  it("should not overwrite data when depth is lower", () => {
    // give
    const table = new TranspositionTable(3);
    const board = parseFEN(
      "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1"
    );
    const moves = pseudoLegalMoves(board, WHITE);
    table.record(board, moves[0], 42, ALPHA_SCORE, 4);
    // when
    table.record(board, moves[0], 66, ALPHA_SCORE, 3);
    // then
    const entry = table.getEntry(board);
    expect(decodeScoreFromEntry(entry)).toBe(42);
    expect(decodeDepthFromEntry(entry)).toBe(4);
  });
});
