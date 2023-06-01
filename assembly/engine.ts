import { BitBoard } from "./bitboard";
import { addCastlingMoves } from "./castling";
import { addKingPseudoLegalMoves } from "./king-move-generation";
import { addKnightPseudoLegalMoves } from "./knight-move-generation";
import { MoveStack } from "./move-stack";
import { addPawnPseudoLegalMoves } from "./pawn";
import {
  addBishopPseudoLegalMoves,
  addQueenPseudoLegalMoves,
  addRookPseudoLegalMoves,
} from "./sliding-pieces-move-generation";
import { isInCheck } from "./status";

export function removeCheckedBoardFrom(
  moves: StaticArray<u32>,
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

const moveStack = new MoveStack();
export function pseudoLegalMoves(board: BitBoard, player: i8): StaticArray<u32> {
  addPawnPseudoLegalMoves(moveStack, board, player);
  addKnightPseudoLegalMoves(moveStack, board, player);
  addBishopPseudoLegalMoves(moveStack, board, player);
  addRookPseudoLegalMoves(moveStack, board, player);
  addQueenPseudoLegalMoves(moveStack, board, player);
  addKingPseudoLegalMoves(moveStack, board, player);
  addCastlingMoves(moveStack, board, player);

  return moveStack.flush();
}

function hasLegalMove(moves: MoveStack, board: BitBoard, player: i8): boolean {
  for (let index: i8 = 0; index < moves.count; index++) {
    const move: u32 = moves.moves[index];
    board.do(move);
    if (!isInCheck(player, board)) {
      board.undo();
      moves.count = 0;
      return true;
    }
    board.undo();
  }
  moves.count = 0;
  return false;
}

const canMoveStack = new MoveStack();
export function canMove(board: BitBoard, player: i8): boolean {

  addPawnPseudoLegalMoves(canMoveStack, board, player);
  if (hasLegalMove(canMoveStack, board, player)) {
    return true;
  }
  addKnightPseudoLegalMoves(moveStack, board, player);
  if (hasLegalMove(moveStack, board, player)) {
    return true;
  }
  addBishopPseudoLegalMoves(moveStack, board, player);
  if (hasLegalMove(moveStack, board, player)) {
    return true;
  }
  addRookPseudoLegalMoves(moveStack, board, player);
  if (hasLegalMove(moveStack, board, player)) {
    return true;
  }
  addQueenPseudoLegalMoves(moveStack, board, player);
  if (hasLegalMove(moveStack, board, player)) {
    return true;
  }
  addKingPseudoLegalMoves(moveStack, board, player);
  if (hasLegalMove(moveStack, board, player)) {
    return true;
  }

  return false;
}

export function legalMoves(board: BitBoard, player: i8): BitBoard[] {
  const moves: StaticArray<u32> = pseudoLegalMoves(board, player);

  return removeCheckedBoardFrom(moves, board, player);
}
