import { BLACK, maskString, WHITE } from "../../bitboard";
import {
  candidatePassedMask,
  kingProximityBonus,
  passedBlockBonus,
  passedEg,
  passedFileBonus,
  passedLeverageMask,
  passedMg,
  passedRanks,
} from "../../evaluation/stockfish-passed-pawns";
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
    //log(maskString(candidatePassedMask(board, WHITE)));
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
    expect(passedLeverageMask(board, BLACK)).toBe(
      ((<u64>1) << 21) | ((<u64>1) << 27)
    );
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

  it("should compute passed block bonus", () => {
    let board = parseFEN(
      "rnbqkbnr/p1p2ppp/p1P5/3P4/P1Np1P2/5pP1/P3K1PP/R1BQ1BNR b kq - 1 4"
    );
    expect(passedBlockBonus(board, WHITE)).toBe(<i16>0);
    expect(passedBlockBonus(board, BLACK)).toBe(<i16>35);

    board = parseFEN(
      "r4bnr/1p3kpp/bp1P2p1/np2P3/6p1/3q4/2PPPPPP/RNBQKBNR w KQ - 3 4"
    );
    expect(passedBlockBonus(board, WHITE)).toBe(<i16>60);
    expect(passedBlockBonus(board, BLACK)).toBe(<i16>0);

    board = parseFEN(
      "r4bnr/1p3kpp/bp1P2p1/np2P3/6p1/6q1/2PPPPPP/RNBQKBNR w KQ - 3 4"
    );
    expect(passedBlockBonus(board, WHITE)).toBe(<i16>168);
    expect(passedBlockBonus(board, BLACK)).toBe(<i16>0);
  });
  it("should compute passed file", () => {
    let board = parseFEN(
      "r4bnr/1p3kpp/bp1P2p1/np2P3/6p1/6q1/2PPPPPP/RNBQKBNR w KQ - 3 4"
    );
    expect(passedFileBonus(board, WHITE)).toBe(<i16>6);
    expect(passedFileBonus(board, BLACK)).toBe(<i16>0);

    board = parseFEN(
      "rnbqkbnr/p2pp3/p7/1p2p3/2p1p1P1/1P1P2P1/PP4PP/RNBQKBNR w KQkq - 0 4"
    );
    expect(passedFileBonus(board, WHITE)).toBe(<i16>1);
    expect(passedFileBonus(board, BLACK)).toBe(<i16>3);
  });

  it("should compute passed mg bonuses", () => {
    let board = parseFEN(
      "rnbqkbnr/p2pp3/p7/1p2p3/2p1p1P1/1P1P2P1/PP4PP/RNBQKBNR w KQkq - 0 4"
    );
    expect(passedMg(board, WHITE)).toBe(<i16>42);
    expect(passedMg(board, BLACK)).toBe(<i16>29);
  });

  it("should compute king proximity bonuses", () => {
    let board = parseFEN(
      "rnbqkbnr/p2pp3/p7/1p2p3/2p1p1P1/1P1P2P1/PP4PP/RNBQKBNR w KQkq - 0 4"
    );
    expect(kingProximityBonus(board, WHITE)).toBe(<i16>2);
    expect(kingProximityBonus(board, BLACK)).toBe(<i16>-42);
  });

  it("should compute passed eg bonuses", () => {
    let board = parseFEN(
      "rnbqkbnr/p2pp3/p7/1p2p3/2p1p1P1/1P1P2P1/PP4PP/RNBQKBNR w KQkq - 0 4"
    );
    expect(passedEg(board, WHITE)).toBe(<i16>91);
    expect(passedEg(board, BLACK)).toBe(<i16>6);
  });

  it("should compute candidated passed (bug))", () => {
    let board = parseFEN(
      "8/Q5pp/3BkPN1/4p2P/n4p2/8/P7/5RK1 w kq - 18 15"
    );
    //log(maskString(1 << 2));
    //log(ctz(1 << 2));
    //log(maskString(candidatePassedMask(board, BLACK)));
    expect(popcnt(candidatePassedMask(board, BLACK))).toBe(2);

  });

  it("should compute candidated passed (again)", () => {
    let board = parseFEN(
      "8/Q2pP3/3BkPN1/4p3/n4p2/4p1P1/8/5RK1 w kq - 18 15"
    );
    //log(maskString(1 << 2));
    //log(ctz(1 << 2));
    //log(maskString(candidatePassedMask(board, WHITE)));
    //log(maskString(candidatePassedMask(board, BLACK)));
    expect(popcnt(candidatePassedMask(board, BLACK))).toBe(3);
    expect(popcnt(candidatePassedMask(board, WHITE))).toBe(3);

  });
  it("should compute passed eg bonuses bis", () => {
    let board = parseFEN(
      "8/Q5pp/3BkPN1/4p2P/n4p2/8/P7/5RK1 w kq - 18 15"
    );
    //log(maskString(candidatePassedMask(board, WHITE)));
    //log(maskString(candidatePassedMask(board, BLACK)));
    //expect(passedLeverageMask(board, BLACK)).toBe(<i16>7);
    expect(passedEg(board, BLACK)).toBe(<i16>98);
    expect(passedEg(board, WHITE)).toBe(<i16>117);
  });
});
