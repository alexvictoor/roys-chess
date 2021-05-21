import { BLACK, encodeCapture, PAWN, QUEEN, WHITE } from "../bitboard";
import { parseFEN } from "../fen-parser";
import {
  findSmallerAttackerPosition,
  staticExchangeEvaluation,
} from "../static-exchange-evaluation";

describe("Attacker finder", () => {
  it("should find smaller attacker when it is a pawn", () => {
    const board = parseFEN("7k/p7/1p6/P7/8/4B3/8/1Q5K b - - 0 1");

    expect(
      findSmallerAttackerPosition(board, WHITE, 41, board.getAllPiecesMask())
    ).toBe(32);
  });
  it("should find smaller attacker when it is a knight", () => {
    const board = parseFEN("7k/p7/1p6/8/2N5/4B3/8/1Q5K b - - 0 1");

    expect(
      findSmallerAttackerPosition(board, WHITE, 41, board.getAllPiecesMask())
    ).toBe(26);
  });
  it("should find smaller attacker when it is a bishop", () => {
    const board = parseFEN("7k/p7/1p6/8/8/4B3/8/1Q5K b - - 0 1");

    expect(
      findSmallerAttackerPosition(board, WHITE, 41, board.getAllPiecesMask())
    ).toBe(20);
  });
  it("should find smaller attacker when it is a rook", () => {
    const board = parseFEN("7k/p7/1p2R3/8/8/8/8/1Q5K b - - 0 1");

    expect(
      findSmallerAttackerPosition(board, WHITE, 41, board.getAllPiecesMask())
    ).toBe(44);
  });
  it("should find smaller attacker when it is a queen", () => {
    const board = parseFEN("7k/p7/1p6/8/8/8/1R6/1Q5K b - - 0 1");

    expect(
      findSmallerAttackerPosition(
        board,
        WHITE,
        41,
        board.getAllPiecesMask() & ~((<u64>1) << 9)
      )
    ).toBe(1);
  });
  it("should find smaller attacker when it is a king", () => {
    const board = parseFEN("7k/p7/1pK5/8/8/8/8/8 b - - 0 1");

    expect(
      findSmallerAttackerPosition(board, WHITE, 41, board.getAllPiecesMask())
    ).toBe(42);
  });
});

describe("Static exchange evaluation", () => {
  it("should be negative when player loose material after capture", () => {
    const board = parseFEN("7k/p7/1p6/8/8/8/8/1Q5K b - - 0 1");
    const pawnCapture = encodeCapture(
      WHITE + QUEEN,
      1,
      WHITE + QUEEN,
      41,
      BLACK + PAWN,
      41
    );
    expect(staticExchangeEvaluation(board, WHITE, pawnCapture)).toBeLessThan(0);
  });
  it("should be positive when player do not loose material after capture", () => {
    const board = parseFEN("7k/p7/1p6/2Q5/8/8/8/2R4K b - - 0 1");
    const queenCapture = encodeCapture(
      BLACK + PAWN,
      41,
      BLACK + PAWN,
      34,
      WHITE + QUEEN,
      34
    );
    expect(
      staticExchangeEvaluation(board, BLACK, queenCapture)
    ).toBeGreaterThan(0);
  });
  it("should be negative when player could loose a queen", () => {
    const board = parseFEN(
      "r1bqkb1r/ppp1pppp/2P2n2/8/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 4"
    );
    const queenCapture = encodeCapture(
      BLACK + QUEEN,
      59,
      BLACK + QUEEN,
      27,
      WHITE + PAWN,
      27
    );
    expect(staticExchangeEvaluation(board, BLACK, queenCapture)).toBeLessThan(
      600
    );
  });
});
