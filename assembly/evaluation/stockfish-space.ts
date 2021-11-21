import {
  BitBoard,
  BLACK,
  firstColMask,
  firstRowMask,
  leftBorderMask,
  opponent,
  rightBorderMask,
  WHITE,
} from "../bitboard";
import {
  attackByPawnsMask,
  attackMask,
} from "./stockfish-attacks";
import { nonPawnMaterial } from "./stockfish-material";

const centralRows =
  (firstColMask << 2) |
  (firstColMask << 3) |
  (firstColMask << 4) |
  (firstColMask << 5);

export function spaceArea(board: BitBoard, player: i8): i16 {
  const firstRowsMask =
    player == WHITE
      ? (firstRowMask << 8) | (firstRowMask << 16) | (firstRowMask << 24)
      : (firstRowMask << 32) | (firstRowMask << 40) | (firstRowMask << 48);
  const pawnMask = board.getPawnMask(player);
  const opponentPlayer = opponent(player);

  const freeSquaresMask =
    centralRows &
    firstRowsMask &
    ~attackByPawnsMask(board, opponentPlayer) &
    ~pawnMask;

  const squaresBehindPawnsMask =
    player == WHITE
      ? (pawnMask >> 8) | (pawnMask >> 16) | (pawnMask >> 24)
      : (pawnMask << 8) | (pawnMask << 16) | (pawnMask << 24);

  const protectedSquaresMask =
    freeSquaresMask &
    squaresBehindPawnsMask &
    ~attackMask(board, opponentPlayer, false);

  return <i16>popcnt(freeSquaresMask) + <i16>popcnt(protectedSquaresMask);
}

export function space(board: BitBoard, player: i8): i16 {
  if ((nonPawnMaterial(board, WHITE) + nonPawnMaterial(board, BLACK)) < 12222) {
    return 0;
  }
  const pieceCount = <i16>popcnt(board.getPlayerPiecesMask(player));

  const whitePawnMask = board.getPawnMask(WHITE);
  const blackPawnMask = board.getPawnMask(BLACK);
  let blockedPawnsCount = <i16>popcnt((whitePawnMask << 8) & blackPawnMask) * 2;
  blockedPawnsCount += <i16>popcnt((((((whitePawnMask << 15) & rightBorderMask) & blackPawnMask) << 2) & leftBorderMask) & blackPawnMask);
  blockedPawnsCount += <i16>popcnt((((((blackPawnMask >> 15) & leftBorderMask) & whitePawnMask) >> 2) & rightBorderMask) & whitePawnMask);
  
  const weight: i16 = pieceCount - 3 + <i16>Math.min(blockedPawnsCount, 9);
  
  return ((spaceArea(board, player) * weight * weight) >> 4);
}