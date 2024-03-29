import { BLACK, maskString, WHITE } from "../../bitboard";
import { resetCache } from "../../evaluation/stockfish-cache";
import { hangingMask, kingThreatMask, knightOnQueenMask, minorThreats, pawnPushThreatMask, restricted, rookThreats, sliderOnQueen, sliderOnQueenMask, threatSafePawnMask, threatsEg, threatsMg, weakEnemiesMask, weakQueenProtection } from "../../evaluation/stockfish-threats";
import { parseFEN } from "../../fen-parser";

describe("Stockfish threats", () => {

  beforeEach(() => {
    resetCache();
  });

  it("should detect weak enemies", () => {
    const board = parseFEN(
      "rnbqkb1r/ppp3pp/2np2P1/3P4/p1P3B1/P1P1p1PP/4P3/RN1QKBNR b KQkq - 1 2"
    );

    const whiteMask = weakEnemiesMask(board, WHITE);
    const blackMask = weakEnemiesMask(board, BLACK);
    expect(blackMask).toBe(1 << 46);
    expect(whiteMask).toBe((1 << 24) | (1 << 55) | (1 << 58));
  });
  it("should detect weak enemies (bis)", () => {
    const board = parseFEN(
      "r1bqk3/ppp2N1p/2Np1nP1/2PP1R2/1pbr2p1/3n1pPP/1BP2P2/1R3QK1 b KQkq - 2 5"
    );

    const blackMask = weakEnemiesMask(board, BLACK);
    expect(blackMask).toBe(1 << 9 | 1 << 23 | 1 << 34 | 1 << 35 | 1 << 37 | 1 << 46);
  });

  it("should detect weak enemies (ter)", () => {
    const board = parseFEN(
      "rnbqkb1r/ppp1N1pp/2np2P1/3P4/p1P4B/P1P1p1PP/4P3/RN1QK2R w KQkq - 2 3"
    );

    const blackMask = weakEnemiesMask(board, BLACK);
    expect(blackMask).toBe(1 << 23 | 1 << 46 | 1 << 52);
  });

  it("should detect hanging pieces when pieces are not defended", () => {
    const board = parseFEN(
      "rnbqkb1r/ppp3pp/2np2P1/3P4/p1P3B1/P1P1p1PP/4P3/RN1QKBNR b KQkq - 1 2"
    );

    const whiteMask = hangingMask(board, WHITE);
    const blackMask = hangingMask(board, BLACK);
    expect(whiteMask).toBe(1 << 24);
    expect(blackMask).toBe((1 << 46));
  });
  it("should detect hanging pieces when pieces are attacked twice", () => {
    const board = parseFEN(
      "rnbqkb1r/ppp1N1pp/2np2P1/3P4/p1P3B1/P1P1p1PP/4P3/RN1QKB1R w KQkq - 2 3"
    );

    const whiteMask = hangingMask(board, WHITE);

    expect(whiteMask).toBe((1 << 24 | 1 << 58));
  });

  it("should detect pieces threat by king", () => {
    const board = parseFEN(
      "rnbqkb1r/ppp1N1pp/2np2P1/3P4/p1P4B/P1P1p1PP/4P3/RN1QK2R w KQkq - 2 3"
    );

    const whiteMask = kingThreatMask(board, WHITE);
    const blackMask = kingThreatMask(board, BLACK);

    expect(whiteMask).toBe(0);
    expect(blackMask).toBe((1 << 52));
  });

  it("should detect pawn push threats", () => {
    const board = parseFEN(
      "rnbqkb1r/ppp1N1pp/3p2P1/3P1n2/p1P4B/P1P1p1PP/4P3/RN1QK2R b KQkq - 0 3"
    );

    const whiteMask = pawnPushThreatMask(board, WHITE);

    expect(whiteMask).toBe(1 << 37);
  });
  it("should detect pawn push threats when pawn will attack after moving 2 square ahead from initial position", () => {
    const board = parseFEN(
      "rnbqkb1r/ppp1N1pp/3p2P1/3P1n2/p1P4B/P1P1p2P/4P1P1/RN1QK2R w KQkq - 2 3"
    );

    const whiteMask = pawnPushThreatMask(board, WHITE);
    const blackMask = pawnPushThreatMask(board, BLACK);

    expect(whiteMask).toBe(1 << 37);
    expect(blackMask).toBe(0);
  });
  it("should detect pawn push threats when pawn will attack after moving 2 square ahead from initial position (bis)", () => {
    const board = parseFEN(
      "rnbqkb1r/ppp1N1pp/3p2P1/3P1n2/p1P2p1B/P1P4P/3P2P1/RN1QK2R b KQkq - 0 4"
    );

    const whiteMask = pawnPushThreatMask(board, WHITE);
    const blackMask = pawnPushThreatMask(board, BLACK);

    expect(whiteMask).toBe(1 << 37);
    expect(blackMask).toBe(0);
  });

  it("should detect threats by safe pawns", () => {
    const board = parseFEN(
      "rnbqkb1r/ppp1N1pp/3p2P1/3P1n2/p1P3PB/P1P1p2P/4P3/RN1QK2R b KQkq - 0 4"
    );

    const whiteMask = threatSafePawnMask(board, WHITE);
    const blackMask = threatSafePawnMask(board, BLACK);

    expect(whiteMask).toBe(1 << 37);
    expect(blackMask).toBe(0);
  });

  it("should detect safe attacks by slider on queen", () => {
    const board = parseFEN(
      "rnbqk3/ppp1N1pp/3p2P1/2PP1n2/p1br2P1/1P2p2P/5P2/RN1QKB1R w KQkq - 1 5"
    );

    const whiteMask = sliderOnQueenMask(board, WHITE);
    const blackMask = sliderOnQueenMask(board, BLACK);

    expect(whiteMask).toBe(0);
    expect(blackMask).toBe(1 << 17 | 1 << 11 | 1 << 19);
  });

  it("should detect safe attacks by slider on queen taking in account pawn defense", () => {
    const board = parseFEN(
      "r1bqk3/ppp1N1pp/3p2P1/1nPP4/1pbrn1P1/5p1P/1NP2P2/B1RQK2R b KQkq - 2 5"
    );

    const whiteMask = sliderOnQueenMask(board, WHITE);
    const blackMask = sliderOnQueenMask(board, BLACK);

    expect(whiteMask).toBe(0);
    expect(blackMask).toBe(1 << 11 | 1 << 12);
  });

  it("should count safe slider attacks on queen", () => {
    const board = parseFEN(
      "rnbqk3/ppp1N1pp/3p2P1/2PP1n2/p1br2P1/1P2p2P/5P2/RN1QKB1R w KQkq - 1 5"
    );

    const white = sliderOnQueen(board, WHITE);
    const black = sliderOnQueen(board, BLACK);


    expect(white).toBe(0);
    expect(black).toBe(3);
  });

  it("should count twice safe slider attacks on queen when player has lost her queen", () => {
    const board = parseFEN(
      "rnb1k3/ppp1N1pp/3p2P1/2PP1n2/p1br2P1/1P2p2P/5P2/RN1QKB1R w KQkq - 1 5"
    );

    const black = sliderOnQueen(board, BLACK);

    expect(black).toBe(6);
  });

  it("should detect safe attacks by knigh on queen", () => {
    const board = parseFEN(
      "r1bqk3/ppp1N1pp/3p2P1/1nPPN3/1pbrn1P1/5p1P/2P2P2/B1RQKR2 b KQkq - 2 5"
    );

    const whiteMask = knightOnQueenMask(board, WHITE);
    const blackMask = knightOnQueenMask(board, BLACK);

    expect(whiteMask).toBe(1 << 53);
    expect(blackMask).toBe(1 << 18);
  });

  it("should count restricted moves", () => {
    const board = parseFEN(
      "r1bqk3/ppp1NNpp/3p2P1/2PPn3/1pbrn1P1/5p1P/2P2P2/B1RQKR2 b KQkq - 2 5"
    );

    const white = restricted(board, WHITE);
    const black = restricted(board, BLACK);

    expect(white).toBe(12);
    expect(black).toBe(12);
  });
  
  it("should count weak queen protection", () => {
    const board = parseFEN(
      "r1bqk3/ppp2N1p/2Np1nP1/2PP1R1Q/1pbr2p1/3n1pPP/2P2P2/B1R1K3 b KQkq - 2 5"
    );

    const white = weakQueenProtection(board, WHITE);
    const black = weakQueenProtection(board, BLACK);

    expect(white).toBe(1);
    expect(black).toBe(3);
  });

  it("should evaluate minor threats", () => {
    const board = parseFEN(
      "r1bqk3/ppp2N1p/2Np1nP1/2PP1R1Q/1pbr2p1/3n1pPP/2P2P2/B1R1K3 b KQkq - 2 5"
    );

    const whiteThreats = minorThreats(board, WHITE, true);
    const blackThreats = minorThreats(board, BLACK, true);

    expect(whiteThreats).toBe(177);
    expect(blackThreats).toBe(270);

  });
  it("should evaluate minor threats (bis)", () => {
    const board = parseFEN(
      "r1bqk3/ppp2N1p/2Np1nP1/2PP1R2/1pbr2p1/3n1pPP/1BP2P2/1R3QK1 b KQkq - 2 5"
    );

    const blackThreats = minorThreats(board, BLACK, true);

    expect(blackThreats).toBe(175);

  });

  it("should evaluate rook threats", () => {
    const board = parseFEN(
      "2bqk3/ppp2Nrp/2Np1nP1/2PP1R2/1pbr2p1/3n1pPP/1BP2P2/R4QK1 b KQkq - 2 5"
    );

    const whiteThreats = rookThreats(board, WHITE, true);
    const blackThreats = rookThreats(board, BLACK, true);

    expect(whiteThreats).toBe(40);
    expect(blackThreats).toBe(6);

  });

  it("should evaluate middle game threats", () => {
    const board = parseFEN(
      "2bqk3/ppp2Nrp/2Np1nP1/2PP1R2/1pbr2p1/3n1pPP/1BP2P2/R4QK1 b KQkq - 2 5"
    );

    const score = threatsMg(board);

    expect(score).toBe(36);

  });
  it("should evaluate middle game threats bis", () => {
    const board = parseFEN(
      "r1bqkb1r/ppp1pppp/2P2n2/8/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 4"
    );

    const score = threatsMg(board);

    expect(score).toBe(-150);

  });

  it("should evaluate end game threats", () => {
    const board = parseFEN(
      "rnbqkbnr/ppp3pp/3p2P1/3P4/p1P5/P1P1p1PP/4P3/RNBQKBNR w KQkq - 0 2"
    );

    const score = threatsEg(board);

    expect(score).toBe(96);

  });

  it("should evaluate end game threats bis", () => {
    const board = parseFEN(
      "8/Q5pp/3BkPN1/4p2P/n4p2/8/P7/5RK1 w kq - 18 15"
    );

    const score = threatsEg(board);

    expect(score).toBe(-144);

  });

});
