import { EvaluationTable } from "../../evaluation-table";
import { parseFEN } from "../../fen-parser";

// Fix 26 (audit S15): reset() to a new size assigned a StaticArray<u64> to
// the StaticArray<i16> field. Nothing called it, and AssemblyScript only
// compiles what is called, so the type error surfaced the first time a test
// used it. The table must keep working after a resize.
describe("Fix 26: the evaluation table survives a resize", () => {
  it("stores and reads back a score after reset() to another size", () => {
    const table = new EvaluationTable(3);
    const board = parseFEN("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1");

    table.reset(5);
    table.record(board, -42);

    expect(table.getCachedEvaluation(board)).toBe(-42);
  });
});
