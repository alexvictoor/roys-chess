import { BLACK, WHITE } from "../../bitboard";
import {
  countBishopPawns,
  countBishopXrayPawns,
  countMinorBehindPawn,
  countRooksOnQueenFiles,
  kingDistance,
  longDiagonalBishop,
  outpost,
  outpostSquare,
  outpostTotal,
  pawnAttacksSpan,
  piecesMg,
  piecesEg,
  queenInfiltration,
  reachableOutpost,
  rookOnFile,
  rooksOnFile,
  trappedRooks,
  weakQueen,
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
    expect(outpostTotal(board, WHITE, true)).toBe(0);
    expect(outpostTotal(board, BLACK, true)).toBe(31);
  });
  // rnbqk2r/ppp3pp/2np2P1/3Pb3/p1P3B1/P1P1p1PP/4P3/RN1QKBNR w KQkq - 2 3
  it("should evaluate outpost total (bis)", () => {
    const board = parseFEN(
      "rnbqk2r/ppp3pp/2np2P1/3Pb3/p1P3B1/P1P1p1PP/4P3/RN1QKBNR w KQkq - 2 3"
    );
    expect(outpostTotal(board, WHITE, true)).toBe(0);
    expect(outpostTotal(board, BLACK, true)).toBe(30);
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

  it("should count bishop pawns (bis)", () => {
    const board = parseFEN(
      "rnbqkbnr/pppppppp/8/8/8/2PNB1P1/PPP1P1PP/R2K1BNR w KQkq - 0 1"
    );
    expect(countBishopPawns(board, WHITE)).toBe(24);
    expect(countBishopPawns(board, BLACK)).toBe(8);
  });
  
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
    expect(rooksOnFile(board, WHITE, true)).toBe(19);
    expect(rooksOnFile(board, BLACK, true)).toBe(48);
  });

  it("should count trapped rooks", () => {
    const board = parseFEN(
      "rnbqkbn1/pppppp1p/6r1/8/8/1P3P2/1PPPPP1P/RNBQKBNR w KQkq - 0 1"
    );
    expect(trappedRooks(board, WHITE, 7)).toBe(1);
    expect(trappedRooks(board, WHITE, 0)).toBe(0);
  });

  it("should detect weak queens (rook threat)", () => {
    const board = parseFEN(
      "rnbqkb1r/ppppppp1/8/4n2P/7Q/8/PPPPPP1P/RNB1KBNR w KQkq - 2 3"
    );
    expect(weakQueen(board, WHITE)).toBe(1);
    expect(weakQueen(board, BLACK)).toBe(0);
  });
  it("should detect weak queens (bishop threat)", () => {
    const board = parseFEN(
      "rnbqkbr1/ppppppp1/8/B3n2P/8/7Q/PPPPPP1P/RNB1K1NR w KQkq - 0 4"
    );
    expect(weakQueen(board, WHITE)).toBe(1);
    expect(weakQueen(board, BLACK)).toBe(1);
  });
  it("should detect no weak queens", () => {
    const board = parseFEN(
      "rnbqkbnr/ppppppp1/6p1/8/8/4NP2/PPPPPPPR/RNB1KBQ1 b KQkq - 1 1"
    );
    expect(weakQueen(board, WHITE)).toBe(0);
    expect(weakQueen(board, BLACK)).toBe(0);
  });
  it('should detect queen infiltration', () => {
    const board = parseFEN(
      "rnbqkbnr/4pppp/Qp1p4/1p1Q4/2p5/8/PPPPPPPP/RNB1KBNR w KQkq - 0 1"
    );
    expect(queenInfiltration(board, WHITE)).toBe(1);
    expect(queenInfiltration(board, BLACK)).toBe(0);
  });

  it('should compute king distance', () => {
    const board = parseFEN(
      "rnbqkbnr/pppppppp/8/8/4P3/5NB1/PPPP1PPP/RNBQ1RK1 b kq - 1 1"
    );
    expect(kingDistance(board, WHITE, 0)).toBe(6);
    expect(kingDistance(board, BLACK, 0)).toBe(7);
  });

  // rn1qk1nr/pbpp1ppp/4pb2/Np2P3/2P1N3/2B3B1/1PP2PPP/RN1Q1RK1 b kq - 1 3
  it('should detect long diagonal bishops', () => {
    const board = parseFEN(
      "rn1qk1nr/pbpp1ppp/4pb2/Np2P3/2P1N3/2B3B1/1PP2PPP/RN1Q1RK1 b kq - 1 3"
    );
    expect(longDiagonalBishop(board, WHITE)).toBe(1);
    expect(longDiagonalBishop(board, BLACK)).toBe(1);
  });


  it('should compute pieces mg', () => {
    const board = parseFEN('rnbqkbnr/pppppppp/8/8/4P1B1/5N2/PPPP1PPP/RNBQ1RK1 b kq - 1 1');
    expect(piecesMg(board)).toBe(-49)
  })

  it('should compute pieces eg', () => {
    const board = parseFEN('rnbqkbnr/ppp3pp/3p2P1/3P4/p1P5/P1P1p1PP/4P3/RNBQKBNR w KQkq - 0 2');
    expect(piecesEg(board)).toBe(-60)
  })

  it('should compute pieces eg bis', () => {
    const board = parseFEN('8/Q5pp/3BkPN1/4p2P/n4p2/8/P7/5RK1 w kq - 18 15');
    expect(piecesEg(board)).toBe(-54)
  })

});
