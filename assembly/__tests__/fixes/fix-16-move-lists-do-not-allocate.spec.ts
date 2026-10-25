import { chooseBestMove, reset } from "../../alpha-beta-evaluation";
import { WHITE } from "../../bitboard";
import { parseFEN } from "../../fen-parser";
import { perft2 } from "../../perft";

// Fix 16 (audit S13): every node allocated a fresh array for its move list.
// Move lists now live in a preallocated arena. The perft counts protect the
// move generator through the change; the memory check pins the no-allocation
// property.
const fen = "r2q1rk1/pp2bppp/2n1pn2/3p4/3P4/2NBPN2/PP3PPP/R2QK2R w KQ - 0 10";

describe("Fix 16: move generation through the arena", () => {
  it("still generates the right moves (perft 3 from the start position)", () => {
    const board = parseFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

    expect(perft2(3, board, WHITE)).toBe(8902);
  });

  it("still generates the right moves (perft 3 from kiwipete)", () => {
    const board = parseFEN("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1");

    expect(perft2(3, board, WHITE)).toBe(97862);
  });

  it("a search does not grow the wasm memory", () => {
    reset();
    chooseBestMove(WHITE, parseFEN(fen), 5); // warm up: tables and arenas are in place
    const pagesBefore = memory.size();

    reset();
    chooseBestMove(WHITE, parseFEN(fen), 5);

    expect(memory.size()).toBe(pagesBefore);
  });
});
