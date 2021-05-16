import {
  analyseBestMove,
  chooseBestMove,
  evaluatePosition,
} from "../alpha-beta-evaluation";
import {
  BitBoard,
  BLACK,
  decodeSrcPiece,
  KING,
  maskString,
  PAWN,
  QUEEN,
  ROOK,
  WHITE,
} from "../bitboard";
import { legalMoves } from "../engine";
import { parseFEN } from "../fen-parser";
import { evaluateQuiescence } from "../quiescence-evaluation";
import { isCheckMate } from "../status";

function encodeScore(action: u64, score: i8): u64 {
  //log("encodeStore " + maskString(action));
  //log("encodedStore " + maskString((<u64>score) | (action << 32)));
  return (<u64>score) | (action << 32);
}
const mask: u64 = ((<u64>1) << 8) - 1;
function decodeScore(action: u64): i8 {
  return <i8>(action & mask);
}

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

  it("should find best moves", () => {
    const board = parseFEN("4k1r1/p4p2/6pp/4n3/4B3/6P1/P3KP1P/7R b  -");
    const move = chooseBestMove(BLACK, board, 5);
    expect(decodeSrcPiece(<u32>move)).toBe(BLACK + KING);
    const moves = analyseBestMove(board);
    expect(moves[0]).toBe(<u32>move);
  });
});
