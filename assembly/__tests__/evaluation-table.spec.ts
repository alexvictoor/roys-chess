import { EvaluationTable } from "../evaluation-table";
import { parseFEN } from "../fen-parser";

describe("Evaluation table", () => {
  it("should store data", () => {
    // give
    const table = new EvaluationTable(3);
    const board = parseFEN(
      "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1"
    );
    // when
    table.record(board, 42);
    // then
    expect(table.getCachedEvaluation(board)).toBe(42);
  });
});
