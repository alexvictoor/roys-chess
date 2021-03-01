import { BitBoard, getPositionsFromMask, opponent } from "./bitboard";
import { kingMoves } from "./king-move-generation";
import { knightMoves } from "./knight-move-generation";
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
  let bishopMask = board.getBishopMask(opponentPlayer);
  let bishopPosition = <i8>ctz(bishopMask);
  while (bishopMask) {
    if (!!(kingMask & bishopMoves(board.getAllPiecesMask(), bishopPosition))) {
      return true;
    }
    bishopMask = bishopMask >> (bishopPosition + 1);
    bishopPosition += <i8>ctz(bishopMask) + 1;
  }
  return false;
}
function isInCheckByQueen(
  kingMask: u64,
  opponentPlayer: i8,
  board: BitBoard
): boolean {
  let queenMask = board.getQueenMask(opponentPlayer);
  let queenPosition = <i8>ctz(queenMask);
  while (queenMask) {
    if (!!(kingMask & queenMoves(board.getAllPiecesMask(), queenPosition))) {
      return true;
    }
    queenMask = queenMask >> (queenPosition + 1);
    queenPosition += <i8>ctz(queenMask) + 1;
  }
  return false;
}
function isInCheckByKnight(
  kingMask: u64,
  opponentPlayer: i8,
  board: BitBoard
): boolean {
  let knightMask = board.getKnightMask(opponentPlayer);
  let knightPosition = <i8>ctz(knightMask);
  while (knightMask) {
    if (!!(kingMask & knightMoves(board.getAllPiecesMask(), knightPosition))) {
      return true;
    }
    knightMask = knightMask >> (knightPosition + 1);
    knightPosition += <i8>ctz(knightMask) + 1;
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
    if (
      !!(kingMask & kingMoves(board.getAllPiecesMask(), opponentKingPosition))
    ) {
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
    isInCheckByPawn(kingMask, opponentPlayer, board) ||
    isInCheckByKnight(kingMask, opponentPlayer, board) ||
    isInCheckByRook(kingMask, opponentPlayer, board) ||
    isInCheckByBishop(kingMask, opponentPlayer, board) ||
    isInCheckByQueen(kingMask, opponentPlayer, board) ||
    isInCheckByKing(kingMask, opponentPlayer, board)
  );
}
