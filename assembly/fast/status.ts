import { BitBoard, MaskIterator, opponent } from "./bitboard";
import { legalMoves } from "./engine";
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
  kingPosition: i8,
  opponentPlayer: i8,
  board: BitBoard
): boolean {
  const rookMask: u64 = board.getRookMask(opponentPlayer);
  return !!(rookMask & rookMoves(board.getAllPiecesMask(), kingPosition));
}
function isInCheckByBishop(
  kingPosition: i8,
  opponentPlayer: i8,
  board: BitBoard
): boolean {
  const bishopMask = board.getBishopMask(opponentPlayer);
  return !!(bishopMask & bishopMoves(board.getAllPiecesMask(), kingPosition));
}
function isInCheckByQueen(
  kingPosition: i8,
  opponentPlayer: i8,
  board: BitBoard
): boolean {
  const queenMask = board.getQueenMask(opponentPlayer);
  return !!(queenMask & queenMoves(board.getAllPiecesMask(), kingPosition));
}
function isInCheckByKnight(
  kingPosition: i8,
  opponentPlayer: i8,
  board: BitBoard
): boolean {
  const knightMask = board.getKnightMask(opponentPlayer);
  return !!(knightMask & knightMovesFromCache(kingPosition));
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
  const kingPosition = <i8>ctz(kingMask);
  const opponentPlayer = opponent(player);
  return (
    isInCheckByQueen(kingPosition, opponentPlayer, board) ||
    isInCheckByRook(kingPosition, opponentPlayer, board) ||
    isInCheckByBishop(kingPosition, opponentPlayer, board) ||
    isInCheckByPawn(kingMask, opponentPlayer, board) ||
    isInCheckByKnight(kingPosition, opponentPlayer, board) ||
    isInCheckByKing(kingMask, opponentPlayer, board)
  );
}

function isDrawByRepetition(board: BitBoard): boolean {
  const hash = board.hashCode();
  const clock = board.getHalfMoveClock();
  let repetitionCount: i8 = 0;
  let nbLoop: i8 = 0;
  let hashHistoryIndex: i8 = <i8>board.hashHistory.length - 1;

  while (nbLoop < clock && repetitionCount < 2) {
    if (board.hashHistory[hashHistoryIndex] === hash) {
      repetitionCount++;
    }
    hashHistoryIndex--;
    nbLoop++;
  }
  return repetitionCount > 1;
}

export function isDraw(player: i8, board: BitBoard): boolean {
  return (
    board.getHalfMoveClock() == 100 ||
    legalMoves(board, player).length === 0 ||
    isDrawByRepetition(board)
  );
}

export function isCheckMate(player: i8, board: BitBoard): boolean {
  return isInCheck(player, board) && legalMoves(board, player).length === 0;
}
