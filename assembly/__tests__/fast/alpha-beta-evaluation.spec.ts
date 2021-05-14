import {
  chooseBestMove,
  evaluatePosition,
} from "../../fast/alpha-beta-evaluation";
import {
  BitBoard,
  BLACK,
  KING,
  maskString,
  PAWN,
  QUEEN,
  ROOK,
  WHITE,
} from "../../fast/bitboard";
import { legalMoves } from "../../fast/engine";
import { parseFEN } from "../../fast/fen-parser";
import { evaluateQuiescence } from "../../fast/quiescence-evaluation";
import { isCheckMate } from "../../fast/status";

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
  it("should find check mate move", () => {
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
});
