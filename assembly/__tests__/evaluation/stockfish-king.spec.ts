import { BISHOP, BLACK, KNIGHT, maskString, QUEEN, ROOK, WHITE } from "../../bitboard";
import {
  bishopsOnKingRing,
  flankAttack,
  flankDefense,
  isInKingRing,
  kingAttackersCount,
  kingAttackersWeight,
  kingAttacks,
  kingDanger,
  kingMg,
  knightDefender,
  pawnlessFlank,
  possibleChecksMask,
  rooksOnKingRing,
  safeChecksMask,
  shelterStormAndStrength,
  stormSquare,
  stormSquareBad,
  strengthSquare,
  strengthSquareBad,
  unsafeChecksMask,
  unsafeChecksMaskByType,
  weakBonus,
  weakSquaresMask,
} from "../../evaluation/stockfish-king";
import { parseFEN } from "../../fen-parser";

describe("Stockfish king evaluation", () => {
  it("should evaluate king ring", () => {
    const board = parseFEN(
      "3q4/1ppppppp/1bnrkn2/p2r2R1/3NP3/2BR4/PPP1PPPP/2KQ2N1 b KQkq - 1 3"
    );
    expect(isInKingRing(board, WHITE, 1, true)).toBe(true);
    expect(isInKingRing(board, WHITE, 18, true)).toBe(true);
    expect(isInKingRing(board, WHITE, 19, true)).toBe(true);
    expect(isInKingRing(board, WHITE, 19, false)).toBe(false);
  });
  it("should evaluate king attackers count", () => {
    const board = parseFEN(
      "2r5/1ppppppp/R1n1kn2/p2r2b1/2N1Pq2/2BR4/PPPQPPPP/2K3N1 b KQkq - 0 4"
    );
    //log(maskString(kingRingCache[61]));
    expect(kingAttackersCount(board, BLACK)).toBe(2);
    expect(kingAttackersCount(board, WHITE)).toBe(5);
  });
  it("should evaluate king attackers count (bis)", () => {
    const board = parseFEN(
      "2n1k1n1/5ppp/P1qBp1N1/pQP1p3/3b4/1Nn2P2/PB3PPP/3R1RK1 w kq - 16 14"
    );
    //log(maskString(kingRingCache[61]));
    //expect(kingAttackersCount(board, BLACK)).toBe(1);
    expect(kingAttackersCount(board, WHITE)).toBe(3);
  });
  // 2r5/1ppppppp/R1n1kn2/pr4b1/2N1PqQ1/2B1R3/PPP1PPPP/2K3N1 b KQkq - 0 4
  it("should count rooks on king ring", () => {
    const board = parseFEN(
      "2r5/1ppppppp/R1n1kn2/pr4b1/2N1PqQ1/2B1R3/PPP1PPPP/2K3N1 b KQkq - 0 4"
    );
    //log(maskString(kingRingCache[61]));
    expect(rooksOnKingRing(board, BLACK)).toBe(1);
    expect(rooksOnKingRing(board, WHITE)).toBe(1);
  });
  it("should count bishops on king ring", () => {
    const board = parseFEN(
      "2r5/1ppp1ppp/R3kn2/pr2q1b1/2N1pnQ1/1B1PP3/PPPR1PPP/2K3N1 b KQkq - 0 4"
    );
    //log(maskString(kingRingCache[61]));
    expect(bishopsOnKingRing(board, BLACK)).toBe(0);
    expect(bishopsOnKingRing(board, WHITE)).toBe(1);
  });

  it("should evaluate king attackers weight", () => {
    const board = parseFEN(
      "1nb1kbn1/5ppp/5p2/p3p3/PQB3n1/3P1P2/PB2P1PP/RN2K1NR b KQkq - 1 6"
    );
    //log(maskString(kingRingCache[61]));
    expect(kingAttackersWeight(board, BLACK)).toBe(81);
    expect(kingAttackersWeight(board, WHITE)).toBe(62);
  });
  it("should evaluate king attacks", () => {
    const board = parseFEN(
      "1nb1kbn1/5ppp/5p2/p3p3/PQB3n1/3P1P2/PB2P1PP/RN2K1NR b KQkq - 1 6"
    );
    //log(maskString(kingRingCache[61]));
    expect(kingAttacks(board, BLACK)).toBe(1);
    expect(kingAttacks(board, WHITE)).toBe(3);
  });

  it("should evaluate weak squares mask", () => {
    const board = parseFEN(
      "1nb1kbn1/5ppp/5p2/p3p3/PQB3n1/3P1P2/PB2P1PP/RN2K1NR b KQkq - 1 6"
    );
    expect(weakSquaresMask(board, BLACK) & (1 << 13)).not.toBe(0);
    expect(weakSquaresMask(board, BLACK) & (1 << 12)).toBe(0);
  });

  it("should evaluate weak bonus", () => {
    const board = parseFEN(
      "1nbnkb2/5ppp/5p2/p3p3/PQB3n1/3P1P2/PB2P1PP/RN2K1NR b KQkq - 1 6"
    );
    expect(weakBonus(board, WHITE)).toBe(1);
    expect(weakBonus(board, BLACK)).toBe(2);
  });

  it("should evaluate possible checks", () => {
    const board = parseFEN(
      "1nb1kbn1/3q1ppp/P4p2/p3p3/1QB3n1/1N1P1P2/PB2P1PP/R3K1NR b KQkq - 3 7"
    );
    expect(possibleChecksMask(board, BLACK, BISHOP) & (1 << 25)).not.toBe(0);
    expect(possibleChecksMask(board, BLACK, BISHOP) & ~(1 << 25)).toBe(0);
    expect(possibleChecksMask(board, WHITE, QUEEN) & (1 << 24)).not.toBe(0);
  });

  it("should evaluate safe checks", () => {
    const board = parseFEN(
      "1nb1k1n1/3q1ppp/P4p2/p3p1bN/1QB5/1N1PnP2/PB2P1PP/2R1K2R b kq - 7 9"
    );
    expect(safeChecksMask(board, WHITE, BISHOP)).toBe(1 << 33);
    expect(safeChecksMask(board, WHITE, KNIGHT)).toBe(1 << 54);

    const board2 = parseFEN(
      "1nb1k1n1/3q1ppp/P4p2/p3p1bN/2B5/1NQPnP2/PB2P1PP/2R1K2R b kq - 7 9"
    );
    expect(safeChecksMask(board2, WHITE, BISHOP)).toBe(0);

    const board3 = parseFEN(
      "1nb1k1n1/3q1ppp/P4p2/p1PNp1bN/2Q5/4nP2/PB1BP1PP/2R1K2R b kq - 7 9"
    );
    expect(safeChecksMask(board3, WHITE, QUEEN)).toBe(0);
  });

  it("should evaluate safe checks BUG", () => {
    const board = parseFEN(
      "r4bnr/3p2pp/b3K1pq/n2P4/k3P1p1/8/3PPPPP/RNBQ1BNR w KQ - 5 5"
    );
    expect(safeChecksMask(board, WHITE, ROOK)).toBe(1 << 8);
    expect(safeChecksMask(board, BLACK, ROOK)).toBe(1 << 60);
  });

  // type 0 => 
  // type 1 => bishop
  // type 2 => rook

  xit("should evaluate unsafe checks XXX", () => {
    const board = parseFEN(
      "1nb1k1n1/3q1ppp/P4p2/p1P1p1bN/2BQ4/1N2nP2/PB2P1PP/2R1K2R b kq - 9 10"
    );
    log(maskString(unsafeChecksMask(board, WHITE)))
    log(maskString(unsafeChecksMaskByType(board, WHITE, KNIGHT)))
    expect(unsafeChecksMask(board, WHITE)).toBe(
      (1 << 33) | (1 << 53)
    );
  });

  xit("should evaluate unsafe checks bis", () => {
    const board = parseFEN(
      "r4bnr/3p2pp/b3K1pq/n2P4/k3P1p1/8/3PPPPP/RNBQ1BNR w KQ - 5 5"
    );
    log(maskString(unsafeChecksMask(board, WHITE)))
    expect(unsafeChecksMask(board, WHITE)).toBe(0);
    //expect(unsafeChecksMask(board, BLACK)).toBe(0);
  });

  it("should evaluate kings flank attacks", () => {
    const board = parseFEN(
      "2n1k1n1/5ppp/P1qBp1N1/pQP1p3/3b4/1Nn2P2/PB3PPP/3R1RK1 w kq - 16 14"
    );
    expect(flankAttack(board, WHITE)).toBe(16);
    expect(flankAttack(board, BLACK)).toBe(7);
  });

  it("should evaluate kings flank defenses", () => {
    const board = parseFEN("knnb4/8/pp6/8/6P1/5PRB/5PPP/5RK1 b kq - 0 15");
    expect(flankDefense(board, WHITE)).toBe(10);
    expect(flankDefense(board, BLACK)).toBe(15);
  });

  it("should evaluate knight defenders", () => {
    const board = parseFEN("1n2n3/2kb4/pp6/8/6P1/5PRB/5PPP/4QRK1 b kq - 0 15");
    expect(knightDefender(board, WHITE)).toBe(0);
    expect(knightDefender(board, BLACK)).toBe(3);
  });

  it("should evaluate storm square when there is no pawns ", () => {
    const board = parseFEN(
      "2n1k1n1/8/2qB2N1/1Q6/3b4/1Nn5/1B6/3R1RK1 w kq - 16 14"
    );
    expect(stormSquareBad(board, WHITE)).toBe(3824);
    expect(stormSquareBad(board, BLACK)).toBe(3824);
  });
  it("should evaluate storm square when there is no pawns ", () => {
    const board = parseFEN(
      "2n1k1n1/8/2qB2N1/1Q6/3b4/1Nn5/1B6/3R1RK1 w kq - 16 14"
    );
    expect(stormSquare(board, WHITE)[12]).toBe(-36);
    expect(stormSquare(board, BLACK)[17]).toBe(125);
  });
  it("should evaluate storm square", () => {
    const board = parseFEN(
      "2n1k1n1/8/2qB2N1/1Q6/3b4/1Nn2P2/1B6/3R1RK1 w kq - 16 14"
    );
    expect(stormSquareBad(board, BLACK)).toBe(3824);
    expect(stormSquareBad(board, WHITE)).toBe(3440);
  });
  it("should evaluate storm square", () => {
    const board = parseFEN(
      "2n1k1n1/8/2qB2N1/1Q6/3bp3/1Nn1P3/1B6/3R1RK1 w kq - 16 14"
    );
    expect(stormSquareBad(board, BLACK)).toBe(3926);
    expect(stormSquareBad(board, WHITE)).toBe(3989);
  });
  it("should evaluate storm square", () => {
    const board = parseFEN(
      "2n1k1n1/5ppp/P1qBp1N1/pQP1p3/3b4/1Nn2P2/PB3PPP/3R1RK1 w kq - 16 14"
    );
    expect(stormSquareBad(board, WHITE)).toBe(1226);
    expect(stormSquareBad(board, BLACK)).toBe(2604);
  });
  it("should evaluate storm square", () => {
    const board = parseFEN(
      "2n1k1n1/5ppp/P1qBp1N1/pQP1p3/3b4/1Nn2P2/PB3PPP/3R1RK1 w kq - 16 14"
    );
    expect(stormSquare(board, WHITE)[32]).toBe(130);
    expect(stormSquare(board, BLACK)[32]).toBe(90);
  });
  it("should evaluate storm square", () => {
    const board = parseFEN(
      "2n1k1n1/5ppp/P1qBp1N1/pQP1p3/3b4/1Nn2P2/PB3PPP/3R1RK1 w kq - 16 14"
    );
    expect(stormSquare(board, WHITE)[7]).toBe(125);
    expect(stormSquare(board, BLACK)[7]).toBe(56);
  });

  it("should evaluate strength square when there is no pawns", () => {
    const board = parseFEN(
      "2n1k1n1/8/2qB2N1/1Q6/3b4/1Nn5/1B6/3R1RK1 w kq - 16 14"
    );
    expect(strengthSquareBad(board, BLACK)).toBe(-4448);
    expect(strengthSquareBad(board, WHITE)).toBe(-4448);
  });
  it("should evaluate strength square", () => {
    const board = parseFEN(
      "2n1k1n1/5ppp/P1qBp1N1/pQP1p3/3b4/1Nn2P2/PB3PPP/3R1RK1 w kq - 16 14"
    );
    expect(strengthSquareBad(board, BLACK)).toBe(-1284);
    expect(strengthSquareBad(board, WHITE)).toBe(-2233);
  });
  it("should evaluate strength square", () => {
    const board = parseFEN(
      "2n1k1n1/5ppp/P1qBp1N1/pQP1p3/3b4/1Nn2P2/PB3PPP/3R1RK1 w kq - 16 14"
    );
    expect(strengthSquare(board, BLACK)[32]).toBe(12);
    expect(strengthSquare(board, WHITE)[32]).toBe(10);
    expect(strengthSquare(board, WHITE)[62]).toBe(222);
    expect(strengthSquare(board, BLACK)[62]).toBe(-54);
  });

  it("should evaluate shelter storm", () => {
    const board = parseFEN(
      "2n1k1n1/5ppp/P1qBp1N1/pQP1p3/3b4/1Nn2P2/PB3PPP/3R1RK1 w kq - 16 14"
    );
    expect(shelterStormAndStrength(board, WHITE)[0]).toBe(48);
    expect(shelterStormAndStrength(board, BLACK)[0]).toBe(56);
  });
  it("should evaluate shelter strength", () => {
    const board = parseFEN(
      "2n1k1n1/5ppp/P1qBp1N1/pQP1p3/3b4/1Nn2P2/PB3PPP/3R1RK1 w kq - 16 14"
    );
    expect(shelterStormAndStrength(board, WHITE)[1]).toBe(222);
    expect(shelterStormAndStrength(board, BLACK)[1]).toBe(222);
  });

  xit("should evaluate king danger", () => {
    const board = parseFEN(
      "2n1k1n1/5ppp/P1qBp1N1/pQP1p3/3b4/1Nn2P2/PB3PPP/3R1RK1 w kq - 16 14"
    );
    expect(kingDanger(board, BLACK)).toBe(208);
    expect(kingDanger(board, WHITE)).toBe(1739);
  });

  xit("should evaluate king danger bis", () => {
    const board = parseFEN(
      "r4bnr/3p2pp/b3K1pq/n2P4/k3P1p1/8/3PPPPP/RNBQ1BNR w KQ - 5 5"
    );
    expect(kingDanger(board, WHITE)).toBe(4039);
    expect(kingDanger(board, BLACK)).toBe(2821);
  });

  it("should evaluate pawnless flank", () => {
    const board = parseFEN(
      "r4bnr/3p2pp/b3K1pq/n2P4/k3P1p1/8/3PPPPP/RNBQ1BNR w KQ - 5 5"
    );
    expect(pawnlessFlank(board, BLACK)).toBe(false);
    expect(pawnlessFlank(board, WHITE)).toBe(true);
  });

  it("should evaluate middle game king bonus", () => {
    const board = parseFEN(
      "r4bnr/3p2pp/b3K1pq/n2P4/k3P1p1/8/3PPPPP/RNBQ1BNR w KQ - 5 5"
    );
    expect(kingMg(board, BLACK)).toBe(1889);
   //expect(kingMg(board, WHITE)).toBe(4202);
  });
});
