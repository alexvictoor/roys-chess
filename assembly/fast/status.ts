import { BitBoard, getPositionsFromMask, opponent } from "./bitboard";
import { kingMoves } from "./king-move-generation";
import { knightMovesFromCache } from "./knight-move-generation";
import { pawnAttacks } from "./pawn";
import {
  bishopMoves,
  queenMoves,
  rookMoves,
} from "./sliding-pieces-move-generation";

function isInCheckByRook(
  kingMask: u64,
  opponentPlayer: i8,
  board: BitBoard
): boolean {
  const rookMask: u64 = board.getRookMask(opponentPlayer);
  const rookPositions: i8[] = getPositionsFromMask(rookMask);
  for (let i = 0; i < rookPositions.length; i++) {
    if (!!(kingMask & rookMoves(board.getAllPiecesMask(), rookPositions[i]))) {
      return true;
    }
  }
  return false;
}
function isInCheckByBishop(
  kingMask: u64,
  opponentPlayer: i8,
  board: BitBoard
): boolean {
  const bishopMask = board.getBishopMask(opponentPlayer);
  const bishopPositions: i8[] = getPositionsFromMask(bishopMask);
  for (let i = 0; i < bishopPositions.length; i++) {
    if (kingMask & bishopMoves(board.getAllPiecesMask(), bishopPositions[i])) {
      return true;
    }
  }
  return false;
}
function isInCheckByQueen(
  kingMask: u64,
  opponentPlayer: i8,
  board: BitBoard
): boolean {
  const queenMask = board.getQueenMask(opponentPlayer);
  const queenPositions: i8[] = getPositionsFromMask(queenMask);
  for (let i = 0; i < queenPositions.length; i++) {
    if (kingMask & queenMoves(board.getAllPiecesMask(), queenPositions[i])) {
      return true;
    }
  }
  return false;
}
function isInCheckByKnight(
  kingMask: u64,
  opponentPlayer: i8,
  board: BitBoard
): boolean {
  const knightMask = board.getKnightMask(opponentPlayer);
  const knightPositions: i8[] = getPositionsFromMask(knightMask);

  for (let i = 0; i < knightPositions.length; i++) {
    if (kingMask & knightMovesFromCache(knightPositions[i])) {
      return true;
    }
  }
  return false;
}

function isInCheckByKing(
  kingMask: u64,
  opponentPlayer: i8,
  board: BitBoard
): boolean {
  const opponentKingMask = board.getKingMask(opponentPlayer);
  const opponentKingPosition = <i8>ctz(opponentKingMask);
  if (opponentKingMask) {
    if (!!(kingMask & kingMoves(opponentKingPosition))) {
      return true;
    }
  }
  return false;
}
function isInCheckByPawn(
  kingMask: u64,
  opponentPlayer: i8,
  board: BitBoard
): boolean {
  const opponentPawnMask = board.getPawnMask(opponentPlayer);
  return !!(pawnAttacks(opponentPlayer, opponentPawnMask) & kingMask);
}
export function isInCheck(player: i8, board: BitBoard): boolean {
  const kingMask = board.getKingMask(player);
  const opponentPlayer = opponent(player);
  return (
    isInCheckByQueen(kingMask, opponentPlayer, board) ||
    isInCheckByRook(kingMask, opponentPlayer, board) ||
    isInCheckByBishop(kingMask, opponentPlayer, board) ||
    isInCheckByPawn(kingMask, opponentPlayer, board) ||
    isInCheckByKnight(kingMask, opponentPlayer, board) ||
    isInCheckByKing(kingMask, opponentPlayer, board)
  );
}
