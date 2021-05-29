import { Game } from "..";
import { analyseBestMove, chooseBestMove } from "../alpha-beta-evaluation";
import {
  BitBoard,
  BLACK,
  decodeCapturedPiece,
  decodeFromPosition,
  decodeSrcPiece,
  encodeMove,
  KING,
  KNIGHT,
  PAWN,
  QUEEN,
  ROOK,
  toNotation,
  WHITE,
} from "../bitboard";
import { parseFEN } from "../fen-parser";
import { isCheckMate } from "../status";

describe("Alpha-Beta move chooser", () => {
  xit("should find check mate move", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KING, WHITE, 6);
    board.putPiece(ROOK, WHITE, 5);
    board.putPiece(PAWN, WHITE, 13);
    board.putPiece(PAWN, WHITE, 14);
    board.putPiece(PAWN, WHITE, 15);

    board.putPiece(KING, BLACK, 56);
    board.putPiece(ROOK, WHITE, 43);
    board.putPiece(ROOK, WHITE, 50);

    board.putPiece(QUEEN, BLACK, 23);
    board.putPiece(PAWN, BLACK, 30);
    board.putPiece(PAWN, BLACK, 31);
    // when
    const move = chooseBestMove(WHITE, board, 1);
    // then
    const nextBoard = board.execute(<u32>(move & 0xffffffff));
    expect(isCheckMate(BLACK, nextBoard)).toBe(true);
  });

  xit("should find best moves", () => {
    const board = parseFEN("4k1r1/p4p2/6pp/4n3/4B3/6P1/P3KP1P/7R b  -");
    const move = chooseBestMove(BLACK, board, 5);
    expect(decodeSrcPiece(<u32>move)).toBe(BLACK + KING);
    const moves = analyseBestMove(board, 7);
    expect(moves[0]).toBe(<u32>move);
  });
  xit("should find best moves even when checkmate is close", () => {
    const board = parseFEN("8/2R5/1Q6/8/1k6/8/8/5K2 b - - 0 1");
    const move = chooseBestMove(BLACK, board, 1);
    expect(decodeSrcPiece(<u32>move)).toBe(BLACK + KING);
  });

  it("should move piece that would be captured", () => {
    const board = parseFEN(
      "r1bqkbnr/ppp1pppp/2n5/3P4/4p3/2N5/PPP2PPP/R1BQKBNR b KQkq - 0 4"
    );
    const move = chooseBestMove(BLACK, board, 1);
    log(toNotation(<u32>move));
    expect(decodeSrcPiece(<u32>move)).toBe(BLACK + KNIGHT);
  });
  it("should move piece that would be captured", () => {
    const board = parseFEN(
      "rnbqkb1r/pppppppp/4n3/3P4/4P3/8/PPP2PPP/RNBQKBNR b KQkq - 1 4"
    );
    const move = chooseBestMove(BLACK, board, 1);
    log(toNotation(<u32>move));
    expect(decodeSrcPiece(<u32>move)).toBe(BLACK + KNIGHT);
    expect(decodeFromPosition(<u32>move)).toBe(44);
  });

  xit("should capture knight with a pawn", () => {
    const board = parseFEN(
      "r1bqkbnr/ppp2ppp/2n1p3/3P4/4p3/2N5/PPP2PPP/R1BQKBNR w KQkq - 0 4"
    );
    const move = chooseBestMove(WHITE, board, 1);
    expect(decodeCapturedPiece(<u32>move)).toBe(BLACK + KNIGHT);
  });
});
