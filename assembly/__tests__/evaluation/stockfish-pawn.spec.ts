import { BLACK, WHITE } from "../../bitboard";
import {
  backward,
  blocked,
  connectedBonus,
  doubled,
  doubledIsolated,
  isolated,
  opposed,
  pawnAttacksSpan,
  pawnsEg,
  pawnsEgFor,
  pawnsMg,
  phalanx,
  supported,
  weakUnopposedPawn,
} from "../../evaluation/stockfish-pawn";
import { parseFEN } from "../../fen-parser";

describe("Stockfish pawn evaluation", () => {
  it("should find one isolated pawn", () => {
    const board = parseFEN(
      "rnbqkbnr/pppppp1p/8/6p1/1P1P4/8/P4PPP/RNBQKBNR b KQkq - 0 1"
    );
    expect(isolated(board, WHITE, 27)).toBe(true);
  });

  it("should find double isolated pawn", () => {
    const board = parseFEN(
      "rnbqkbnr/ppp3pp/4p1p1/7p/4P3/2P1P3/PPP3PP/RNBQKBNR w KQkq - 0 3"
    );
    expect(doubledIsolated(board, WHITE, 28)).toBe(true);
  });

  it("should find backward pawn", () => {
    const board = parseFEN(
      "rnbqkbnr/pppppppp/8/3P4/8/P4P2/PP3PPP/RNBQKBNR b KQkq d3 0 1"
    );
    expect(backward(board, WHITE, 35)).toBe(true);
  });

  it("should find backward pawn bis", () => {
    const board = parseFEN(
      "rnbqkbnr/ppp3pp/3p2P1/3P4/p1P5/P1P1p1PP/4P3/RNBQKBNR w KQkq - 0 2"
    );
    expect(backward(board, WHITE, 16)).toBe(true);
    expect(backward(board, WHITE, 12)).toBe(true);
  });

  it("should find doubled pawn", () => {
    const board = parseFEN(
      "rnbqkbnr/pppppppp/8/3P4/2PP4/8/P1P2PPP/RNBQKBNR b KQkq d3 0 1"
    );
    expect(doubled(board, WHITE, 35)).toBe(false);
  });


  it("should find phalanx pawns", () => {
    const board = parseFEN(
      "rnbqkbnr/pppppppp/8/8/P7/2P1P1PP/1P1P1P2/RNBQKBNR b KQkq a3 0 1"
    );
    expect(phalanx(board, WHITE, 22)).toBe(true);
  });

  it("should find connected pawns", () => {
    const board = parseFEN(
      "rnbqkbnr/pppppppp/8/8/6PP/1P1P1P2/P1P1P3/RNBQKBNR b KQkq - 0 1"
    );
    expect(supported(board, WHITE, 17)).toBe(2);
  });

  it("should find pawn opposition", () => {
    const board = parseFEN(
      "rnbqkbnr/8/2p5/1p6/6PP/8/P3P3/RNBQKBNR w KQkq b6 0 2"
    );
    expect(opposed(board, BLACK, 33)).toBe(false);
  });

  it("should find pawn connected bonus", () => {
    const board = parseFEN(
      "rnbqkbnr/8/2p5/1p6/6PP/8/P3P3/RNBQKBNR w KQkq b6 0 2"
    );
    expect(connectedBonus(board, BLACK, 33)).toBe(45);
  });

  it("should find weak unopposed pawns", () => {
    const board = parseFEN(
      "rnbqkbnr/ppp1pppp/8/p2P4/1P4P1/PP3PPP/8/RNBQKBNR b KQkq - 0 1"
    );
    expect(weakUnopposedPawn(board, WHITE, 35)).toBe(true);
  });

  it("should find pawn opposition bis", () => {
    let board = parseFEN(
      "8/Q5pp/3BkPN1/4p2P/n4p2/8/5P2/5RK1 w kq - 18 15"
    );
    expect(opposed(board, WHITE, 45)).toBe(false);
    board = parseFEN(
      "8/Q3P1pp/3Bk1N1/4p2P/n4p2/8/5P2/5RK1 w kq - 18 15"
    );
    expect(opposed(board, BLACK, 29)).toBe(true);
  });

  it("should find weak unopposed pawns bis", () => {
    const board = parseFEN(
      "8/Q5pp/3BkPN1/4p2P/n4p2/8/P7/5RK1 w kq - 18 15"
    );
    //expect(weakUnopposedPawn(board, WHITE, 8)).toBe(true);
    expect(weakUnopposedPawn(board, WHITE, 45)).toBe(true);
  });

  it("should find blocked pawns", () => {
    const board = parseFEN(
      "rnbqkbnr/ppp3pp/3p2P1/3P4/p1P5/P1P1p1PP/4P3/RNBQKBNR w KQkq - 0 2"
    );
    expect(blocked(board, BLACK, 20)).toBe(2);
  });

  it("should evaluate pawns at middle game", () => {
    const board = parseFEN(
      "rnbqkbnr/ppp3pp/3p2P1/3P4/p1P5/P1P1p1PP/4P3/RNBQKBNR w KQkq - 0 2"
    );
    expect(pawnsMg(board)).toBe(-58);
  });

  // r1bqkbnr/p2n4/4p3/1pP2p1p/p2pp1P1/P1P1NP2/3PPP1R/RNB1KBQ1 w KQkq - 1 4
  it("should evaluate pawns attack spans", () => {
    const board = parseFEN(
      "r1bqkbnr/p2n4/4p3/1pP2p1p/p2pp1P1/P1P1NP2/3PPP1R/RNB1KBQ1 w KQkq - 1 4"
    );
    expect(pawnAttacksSpan(board, WHITE, 24)).toBe(true);
    expect(pawnAttacksSpan(board, WHITE, 32)).toBe(false);
    expect(pawnAttacksSpan(board, WHITE, 33)).toBe(true);
    expect(pawnAttacksSpan(board, BLACK, 17)).toBe(false);
    expect(pawnAttacksSpan(board, BLACK, 18)).toBe(true);
  });

  it("should evaluate pawns at end game", () => {
    const board = parseFEN(
      "rnbqkbnr/ppp3pp/3p2P1/3P4/p1P5/P1P1p1PP/4P3/RNBQKBNR w KQkq - 0 2"
    );
    expect(pawnsEg(board)).toBe(-77);
  });

  it("should evaluate pawns at end game bis", () => {
    const board = parseFEN(
      "8/Q5pp/3BkPN1/4p2P/n4p2/8/P7/5RK1 w kq - 18 15"
    );
    expect(pawnsEgFor(WHITE, board)).toBe(-99);
    expect(pawnsEg(board)).toBe(-130);
    expect(pawnsEgFor(BLACK, board)).toBe(31);
  });
  
  
});
