import { BitBoard } from "./bitboard";
import { addCastlingMoves } from "./castling";
import { addKingPseudoLegalCaptures, addKingPseudoLegalMoves } from "./king-move-generation";
import { addKnightPseudoLegalCaptures, addKnightPseudoLegalMoves } from "./knight-move-generation";
import { MoveStack } from "./move-stack";
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

/** Fill `stack` with every pseudo legal move of `player` (allocation free). */
export function generatePseudoLegalMoves(
  stack: MoveStack,
  board: BitBoard,
  player: i8
): void {
  stack.clear();
  addPawnPseudoLegalMoves(stack, board, player);
  addKnightPseudoLegalMoves(stack, board, player);
  addBishopPseudoLegalMoves(stack, board, player);
  addRookPseudoLegalMoves(stack, board, player);
  addQueenPseudoLegalMoves(stack, board, player);
  addKingPseudoLegalMoves(stack, board, player);
  addCastlingMoves(stack, board, player);
}

/** Fill `stack` with every pseudo legal capture of `player` (allocation free). */
export function generatePseudoLegalCaptures(
  stack: MoveStack,
  board: BitBoard,
  player: i8
): void {
  stack.clear();
  addPawnPseudoLegalCaptures(stack, board, player);
  addKnightPseudoLegalCaptures(stack, board, player);
  addBishopPseudoLegalCaptures(stack, board, player);
  addRookPseudoLegalCaptures(stack, board, player);
  addQueenPseudoLegalCaptures(stack, board, player);
  addKingPseudoLegalCaptures(stack, board, player);
}

const scratchStack = new MoveStack();
/** Allocating variant kept for perft, the opening book and tests. */
export function pseudoLegalMoves(board: BitBoard, player: i8): StaticArray<u32> {
  generatePseudoLegalMoves(scratchStack, board, player);
  return scratchStack.flush();
}

function hasLegalMove(moves: MoveStack, board: BitBoard, player: i8): boolean {
  for (let index = 0; index < moves.count; index++) {
    const move: u32 = moves.at(index);
    board.do(move);
    if (!isInCheck(player, board)) {
      board.undo();
      moves.clear();
      return true;
    }
    board.undo();
  }
  moves.clear();
  return false;
}

const canMoveStack = new MoveStack();
export function canMove(board: BitBoard, player: i8): boolean {
  canMoveStack.clear();
  addPawnPseudoLegalMoves(canMoveStack, board, player);
  if (hasLegalMove(canMoveStack, board, player)) {
    return true;
  }
  addKnightPseudoLegalMoves(canMoveStack, board, player);
  if (hasLegalMove(canMoveStack, board, player)) {
    return true;
  }
  addBishopPseudoLegalMoves(canMoveStack, board, player);
  if (hasLegalMove(canMoveStack, board, player)) {
    return true;
  }
  addRookPseudoLegalMoves(canMoveStack, board, player);
  if (hasLegalMove(canMoveStack, board, player)) {
    return true;
  }
  addQueenPseudoLegalMoves(canMoveStack, board, player);
  if (hasLegalMove(canMoveStack, board, player)) {
    return true;
  }
  addKingPseudoLegalMoves(canMoveStack, board, player);
  if (hasLegalMove(canMoveStack, board, player)) {
    return true;
  }

  return false;
}

export function legalMoves(board: BitBoard, player: i8): BitBoard[] {
  const moves: StaticArray<u32> = pseudoLegalMoves(board, player);

  return removeCheckedBoardFrom(moves, board, player);
}
