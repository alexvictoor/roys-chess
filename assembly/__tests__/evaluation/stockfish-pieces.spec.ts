import { BLACK, WHITE } from "../../bitboard";
import {
  countBishopPawns,
  countBishopXrayPawns,
  countMinorBehindPawn,
  countRooksOnQueenFiles,
  outpost,
  outpostSquare,
  outpostTotal,
  pawnAttacksSpan,
  reachableOutpost,
  rookOnFile,
} from "../../evaluation/stockfish-pieces";
import { parseFEN } from "../../fen-parser";

describe("Stockfish pieces evaluation", () => {
  it("should evaluate pawn attacks span", () => {
    const board = parseFEN(
      "rnbqk1nr/pp1p1p1p/2pPpb2/4P1p1/2P1P3/5P2/P2N2PP/R1BQKBNR w KQkq g6 0 2"
    );
    expect(pawnAttacksSpan(board, WHITE, 0)).toBe(1);
    expect(pawnAttacksSpan(board, BLACK, 0)).toBe(0);
  });
  // rnbqkbnr/ppp3pp/3p2P1/3P4/p1P5/P1P1p1PP/4P3/RNBQKBNR w KQkq - 0 2
  it("should evaluate outpost square", () => {
    const board = parseFEN(
      "rnbqkbnr/ppp3pp/3p2P1/3P4/p1P5/P1P1p1PP/4P3/RNBQKBNR w KQkq - 0 2"
    );
    expect(outpostSquare(board, BLACK, 17)).toBe(1);
    expect(outpostSquare(board, WHITE, 44)).toBe(1);
    expect(outpostSquare(board, WHITE, 8)).toBe(0);
    expect(outpostSquare(board, WHITE, 16)).toBe(0);
  });
  it("should evaluate outpost square (bis)", () => {
    const board = parseFEN(
      "rnbqkb1r/ppp3pp/2np2P1/3P4/p1P3B1/P1P1p1PP/4P3/RN1QKBNR b KQkq - 1 2"
    );
    expect(outpostSquare(board, BLACK, 17)).toBe(1);
    expect(outpostSquare(board, BLACK, 34)).toBe(1);
  });
  it("should evaluate outpost", () => {
    const board = parseFEN(
      "rnbqkbnr/ppp3pp/3pN1P1/3P4/p1P5/P1P1p1PP/4P3/R1BQKBNR w KQkq - 0 2"
    );
    expect(outpost(board, WHITE, 44)).toBe(1);
    //expect(outpost(board, BLACK, 17)).toBe(0);
    //expect(outpost(board, WHITE, 8)).toBe(0);
    //expect(outpost(board, WHITE, 16)).toBe(0);
  });

  // rnbqkb1r/ppp3pp/2np2P1/3P4/p1P5/P1P1p1PP/4P3/RNBQKBNR b KQkq - 1 2
  it("should evaluate reachable outpost", () => {
    const board = parseFEN(
      "rnbqkb1r/ppp3pp/2np2P1/3P4/p1P3B1/P1P1p1PP/4P3/RN1QKBNR b KQkq - 1 2"
    );
    expect(reachableOutpost(board, BLACK, 42)).toBe(2);
    expect(reachableOutpost(board, WHITE, 30)).toBe(2);
  });

  // rnbqkb1r/ppp3pp/2np2P1/3P4/p1P3B1/P1P1p1PP/4P3/RN1QKBNR b KQkq - 1 2
  it("should evaluate outpost total", () => {
    const board = parseFEN(
      "rnbqkb1r/ppp3pp/2np2P1/3P4/p1P3B1/P1P1p1PP/4P3/RN1QKBNR b KQkq - 1 2"
    );
    expect(outpostTotal(board, WHITE)).toBe(0);
    expect(outpostTotal(board, BLACK)).toBe(1);
  });
  // rnbqk2r/ppp3pp/2np2P1/3Pb3/p1P3B1/P1P1p1PP/4P3/RN1QKBNR w KQkq - 2 3
  it("should evaluate outpost total (bis)", () => {
    const board = parseFEN(
      "rnbqk2r/ppp3pp/2np2P1/3Pb3/p1P3B1/P1P1p1PP/4P3/RN1QKBNR w KQkq - 2 3"
    );
    expect(outpostTotal(board, WHITE)).toBe(0);
    expect(outpostTotal(board, BLACK)).toBe(3);
  });

  it("should count minor pieces behind pawns", () => {
    const board = parseFEN(
      "r1bqkbnr/pppn1ppp/3p4/4p3/4P3/5P2/PPPP2PP/RNBQKBNR w KQkq - 1 3"
    );
    expect(countMinorBehindPawn(board, WHITE)).toBe(3);
    expect(countMinorBehindPawn(board, BLACK)).toBe(4);
  });

  it("should count bishop pawns", () => {
    const board = parseFEN(
      "r1bqk2r/pppppppp/2n2n2/8/8/2N5/PPPPPPPP/R1BQK1NR w KQkq - 1 2"
    );
    expect(countBishopPawns(board, WHITE)).toBe(8);
    expect(countBishopPawns(board, BLACK)).toBe(12);
  });
  // r2qk2r/pppppppp/1bn2n2/8/3N4/2B1P3/PPP1PPPP/R2QK1NR w KQkq - 0 3

  it("should count bishop xray pawns", () => {
    const board = parseFEN(
      "r2qk2r/pppppppp/1bn2n2/8/3N4/2B1P3/PPP1PPPP/R2QK1NR w KQkq - 0 3"
    );
    expect(countBishopXrayPawns(board, WHITE)).toBe(1);
    expect(countBishopXrayPawns(board, BLACK)).toBe(2);
  });

  it("should count rooks on queens files", () => {
    const board = parseFEN(
      "3q3r/1ppppppp/1bnrkn2/p5R1/3NP3/2BR3Q/PPP1PPPP/4K1N1 b KQkq - 1 3"
    );
    expect(countRooksOnQueenFiles(board, WHITE)).toBe(1);
    expect(countRooksOnQueenFiles(board, BLACK)).toBe(2);
  });

  it("should evaluate rook on file", () => {
    const board = parseFEN(
      "rnbqkbn1/pppppp1p/6r1/8/8/1P3P2/1PPPPP1P/RNBQKBNR w KQkq - 0 1"
    );
    expect(rookOnFile(board, WHITE, 0)).toBe(1);
    expect(rookOnFile(board, BLACK, 46)).toBe(2);
  });
});
