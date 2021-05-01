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

describe("Alpha-Beta evaluation", () => {
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
    expect(score).toBe(<i16>100000);
  });
});
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
    const nextBoard = board.execute(move);
    expect(isCheckMate(BLACK, nextBoard)).toBe(true);
  });

  xit("freeze ?", () => {
    const board = parseFEN(
      "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1"
      //"r3k2r/p1ppqpb1/Bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPB1PPP/R3K2R b KQkq - 0 1"
      //"r3k2r/p1ppqpb1/Bn2pnp1/3PN3/4P3/2p2Q1p/PPPB1PPP/R3K2R w KQkq - 0 1"
      //"r3k2r/p1ppqpb1/bn2Pnp1/4N3/1p6/2N2Q1p/P1PBBPPP/R3K2R b KQkq - 0 1
    );
    const move = chooseBestMove(WHITE, board, 3);
    log(board.execute(move).toString());
    log(board.execute(move).toFEN());
  });
  xit("freeze ? Error in ~lib/rt/tlsf.ts:243:14", () => {
    const board = parseFEN(
      "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1"
      //"r3k2r/p1ppqpb1/bn2Pnp1/4N3/8/5Q1p/P1PpBPP1/R3K2R w KQkq - 0 1"
      //"r3k2r/p1ppqpb1/bn1Ppnp1/4N3/1p6/2N2Q1p/P1PBBPPP/R3K2R b KQkq - 0 1"
      //"r3k2r/p1ppqpb1/bn2Pnp1/4N3/1p6/2N2Q1p/P1PBBPPP/R3K2R b KQkq - 0 1
    );
    const move = chooseBestMove(WHITE, board, 4);
    log(board.execute(move).toString());
    log(board.execute(move).toFEN());
  });
  xit("freeze 2", () => {
    const board = parseFEN(
      //"r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1"
      //"r3k2r/p1ppqpb1/bn1Ppnp1/4N3/1p6/2N2Q1p/P1PBBPPP/R3K2R b KQkq - 0 1"
      "r3k2r/p1ppqpb1/bn2Pnp1/4N3/8/2p2Q1p/P1PBBPP1/R3K2R b KQkq - 0 1"
    );
    const move = chooseBestMove(BLACK, board, 3);
    log(board.execute(move).toString());
    log(board.execute(move).toFEN());
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
    let alpha: i16 = i16.MIN_VALUE >> 1;
    for (let index = 0; index < moves.length; index++) {
      const score = -evaluatePosition(
        BLACK,
        moves[index],
        0,
        i16.MIN_VALUE >> 1,
        -alpha
      );
      if (score > alpha) {
        alpha = score;
      }
    }
    log("alpha" + alpha.toString());
  });
});
