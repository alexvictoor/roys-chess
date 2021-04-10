import {
  chooseBestMove,
  evaluatePosition,
} from "../../fast/alpha-beta-evaluation";
import {
  BitBoard,
  BLACK,
  KING,
  PAWN,
  QUEEN,
  ROOK,
  WHITE,
} from "../../fast/bitboard";
import { legalMoves } from "../../fast/engine";
import { parseFEN } from "../../fast/fen-parser";
import { evaluateQuiescence } from "../../fast/quiescence-evaluation";
import { isCheckMate } from "../../fast/status";

describe(`Alpha-Beta evaluation`, () => {
  xit("should be great when player will win next turn", () => {
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
    const score = evaluatePosition(WHITE, board, 1);
    // then
    expect(score).toBe(100000);
  });
});
describe(`Alpha-Beta move chooser`, () => {
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
    const nextBoard = board.execute(move);
    expect(isCheckMate(BLACK, nextBoard)).toBe(true);
  });

  it("freeze ?", () => {
    const board = parseFEN(
      "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1"
    );
    const move = chooseBestMove(WHITE, board, 0);
    log(board.execute(move).toString());
  });
  xit("OK evaluate q", () => {
    const board = parseFEN(
      "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1"
    );
    const move = evaluateQuiescence(WHITE, board);
    //log(board.execute(move).toString());
  });

  xit("freeze ?", () => {
    const board = parseFEN(
      "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1"
    );
    const moves = legalMoves(board, WHITE);
    log(moves.length);
    let alpha: i32 = i32.MIN_VALUE >> 1;
    for (let index = 0; index < moves.length; index++) {
      const score = -evaluatePosition(
        BLACK,
        moves[index],
        0,
        i32.MIN_VALUE >> 1,
        -alpha
      );
      if (score > alpha) {
        alpha = score;
      }
    }
    log("alpha" + alpha.toString());
  });
});
