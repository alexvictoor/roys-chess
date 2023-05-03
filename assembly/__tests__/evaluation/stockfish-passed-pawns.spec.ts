import { BLACK, WHITE } from "../../bitboard";
import { candidatePassedMask, passedLeverageMask, passedRanks } from "../../evaluation/stockfish-passed-pawns";
import { parseFEN } from "../../fen-parser";

describe("Stockfish passed pawns evaluation", () => {
  it("should detect passed pawns", () => {
    let board = parseFEN(
      "rnbqkbnr/p3pppp/p4p2/4p3/2P5/8/PP1PPPPP/RNBQKBNR b KQkq c3 0 1"
    );
    expect(candidatePassedMask(board, WHITE)).toBe((<u64>1) << 26);

    board = parseFEN(
      "rnbqkbnr/p3pppp/p4p2/3p4/2P5/8/PP1PPPPP/RNBQKBNR b KQkq c3 0 1"
    );
    expect(candidatePassedMask(board, WHITE)).toBe((<u64>1) << 26);

    board = parseFEN(
      "rnbqkbnr/p3pppp/p1p2p2/2P5/3P4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 1"
    );
    expect(candidatePassedMask(board, WHITE)).toBe((<u64>1) << 34);

    board = parseFEN(
      "rnbqkbnr/p4ppp/p4p2/1p2P3/2P5/8/PP2PPPP/RNBQKBNR b KQkq c3 0 1"
    );
    expect(candidatePassedMask(board, WHITE)).toBe((<u64>1) << 26);

    board = parseFEN(
      "rnbqkbnr/p3pppp/p4p2/2p5/P1P5/3P4/P3PPPP/RNBQKBNR w KQkq - 0 4"
    );
    expect(candidatePassedMask(board, WHITE)).toBe(0);

    board = parseFEN(
      "rnbqkbnr/1p2p1pp/1p2P1p1/1p1P4/8/8/2PPPPPP/RNBQKBNR b KQkq - 0 2"
    );
    expect(candidatePassedMask(board, WHITE)).toBe((<u64>1) << 44);

    board = parseFEN(
      "rnbqkbnr/1p1p2pp/1p1P2p1/1p2P3/8/8/2PPPPPP/RNBQKBNR b KQkq - 0 2"
    );
    expect(candidatePassedMask(board, WHITE)).toBe((<u64>1) << 43);

    board = parseFEN(
      "rnbqkbnr/4pppp/p4p2/pP6/4P3/3P4/P3PPPP/RNBQKBNR w KQkq - 0 5"
    );
    expect(candidatePassedMask(board, WHITE)).toBe((<u64>1) << 33);

    board = parseFEN(
      "rnbqkbnr/p4p1p/p7/1p2p3/2p1p1P1/1P1P2P1/PP4PP/RNBQKBNR w KQkq - 0 4"
    );
    expect(candidatePassedMask(board, WHITE)).toBe(<u64>0);

    board = parseFEN(
      "rnbqkbnr/p5p1/pp6/2p1p3/P4Ppp/2PPPP2/P5P1/RNBQKBNR w KQkq - 0 4"
    );
    expect(candidatePassedMask(board, BLACK)).toBe((<u64>1) << 31);

    board = parseFEN(
      "rnbqkbnr/p5pp/p5p1/1pp1p3/8/2PPP1P1/PP4PP/RNBQKBNR b KQkq - 0 3"
    );
    expect(candidatePassedMask(board, WHITE)).toBe((<u64>1) << 19);
  });

  

  it("should detect passed leverable", () => {
    let board = parseFEN(
      "rnbqkbnr/p1p2ppp/p1P5/3P4/P1Np1P2/5pP1/P3K1PP/R1BQ1BNR b kq - 1 4"
    );
    expect(passedLeverageMask(board, WHITE)).toBe((<u64>1) << 42);
    expect(passedLeverageMask(board, BLACK)).toBe((<u64>1) << 21 | (<u64>1) << 27);

  });


  it("should compute passed ranks", () => {
    let board = parseFEN(
      "rnbqkbnr/p1p2ppp/p1P5/3P4/P1Np1P2/5pP1/P3K1PP/R1BQ1BNR b kq - 1 4"
    );
    const whiteRanks = passedRanks(board, WHITE);
    expect(whiteRanks[5]).toBe(1);
    const blackRanks = passedRanks(board, BLACK);
    expect(blackRanks[4]).toBe(1);
    expect(blackRanks[5]).toBe(1);
  });
});



