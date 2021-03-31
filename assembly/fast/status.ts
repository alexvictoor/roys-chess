import { BitBoard, MaskIterator, opponent } from "./bitboard";
import { kingMoves } from "./king-move-generation";
import { knightMovesFromCache } from "./knight-move-generation";
import { pawnAttacks } from "./pawn";
import {
  bishopMoves,
  queenMoves,
  rookMoves,
} from "./sliding-pieces-move-generation";

const positions = new MaskIterator();

function isInCheckByRook(
  kingMask: u64,
  opponentPlayer: i8,
  board: BitBoard
): boolean {
  const rookMask: u64 = board.getRookMask(opponentPlayer);
  positions.reset(rookMask);
  while (positions.hasNext()) {
    if (!!(kingMask & rookMoves(board.getAllPiecesMask(), positions.next()))) {
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
  positions.reset(bishopMask);
  while (positions.hasNext()) {
    if (kingMask & bishopMoves(board.getAllPiecesMask(), positions.next())) {
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
  positions.reset(queenMask);
  while (positions.hasNext()) {
    if (kingMask & queenMoves(board.getAllPiecesMask(), positions.next())) {
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
  positions.reset(knightMask);
  while (positions.hasNext()) {
    if (kingMask & knightMovesFromCache(positions.next())) {
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

export function isDraw(player: i8, board: BitBoard): boolean {
  return board.getHalfMoveClock() == 100;
}
