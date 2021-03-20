import { addCastlingMoves } from "../__tests__/fast/castling.spec";
import { BitBoard } from "./bitboard";
import { addKingPseudoLegalMoves } from "./king-move-generation";
import { addKnightPseudoLegalMoves } from "./knight-move-generation";
import {
  addBishopPseudoLegalMoves,
  addQueenPseudoLegalMoves,
  addRookPseudoLegalMoves,
} from "./sliding-pieces-move-generation";
import { isInCheck } from "./status";

export function legalMoves(board: BitBoard, player: i8): BitBoard[] {
  const moves: u64[] = [];
  addRookPseudoLegalMoves(moves, board, player);
  addBishopPseudoLegalMoves(moves, board, player);
  addKnightPseudoLegalMoves(moves, board, player);
  addQueenPseudoLegalMoves(moves, board, player);
  addKingPseudoLegalMoves(moves, board, player);
  addCastlingMoves(moves, board, player);
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
