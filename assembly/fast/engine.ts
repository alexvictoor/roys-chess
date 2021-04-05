import { addCastlingMoves } from "./castling";
import { BitBoard } from "./bitboard";
import {
  addKingPseudoLegalCaptures,
  addKingPseudoLegalMoves,
} from "./king-move-generation";
import {
  addKnightPseudoLegalCaptures,
  addKnightPseudoLegalMoves,
} from "./knight-move-generation";
import { addPawnPseudoLegalCaptures, addPawnPseudoLegalMoves } from "./pawn";
import {
  addBishopPseudoLegalCaptures,
  addBishopPseudoLegalMoves,
  addQueenPseudoLegalCaptures,
  addQueenPseudoLegalMoves,
  addRookPseudoLegalCaptures,
  addRookPseudoLegalMoves,
} from "./sliding-pieces-move-generation";
import { isInCheck } from "./status";

function removeCheckedBoardFrom(
  moves: u64[],
  board: BitBoard,
  player: i8
): BitBoard[] {
  const result: BitBoard[] = [];
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    const nextBoard = board.execute(move);
    if (!isInCheck(player, nextBoard)) {
      result.push(nextBoard);
    }
  }
  return result;
}

export function legalMoves(board: BitBoard, player: i8): BitBoard[] {
  const moves: u64[] = [];
  addRookPseudoLegalMoves(moves, board, player);
  addBishopPseudoLegalMoves(moves, board, player);
  addKnightPseudoLegalMoves(moves, board, player);
  addQueenPseudoLegalMoves(moves, board, player);
  addKingPseudoLegalMoves(moves, board, player);
  addPawnPseudoLegalMoves(moves, board, player);
  addCastlingMoves(moves, board, player);

  return removeCheckedBoardFrom(moves, board, player);
}

export function legalCaptures(board: BitBoard, player: i8): BitBoard[] {
  const moves: u64[] = [];

  addQueenPseudoLegalCaptures(moves, board, player);
  addRookPseudoLegalCaptures(moves, board, player);
  addBishopPseudoLegalCaptures(moves, board, player);
  addKingPseudoLegalCaptures(moves, board, player);
  addKnightPseudoLegalCaptures(moves, board, player);
  addPawnPseudoLegalCaptures(moves, board, player);

  return removeCheckedBoardFrom(moves, board, player);
}
