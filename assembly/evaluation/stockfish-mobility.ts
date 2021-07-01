import {
  BitBoard,
  BLACK,
  firstColMask,
  leftBorderMask,
  rightBorderMask,
  WHITE,
} from "../bitboard";

export function mobilityAreaMask(board: BitBoard, player: i8): u64 {
  let resultMask: u64 = ~(<u64>0);
  resultMask &= ~board.getKingMask(player);
  resultMask &= ~board.getQueenMask(player);

  const allMask = board.getAllPiecesMask();
  if (player === WHITE) {
    const blockedPawnMask =
      board.getPawnMask(WHITE) &
      ((firstColMask << 8) | (firstColMask << 16) | (allMask >> 8));
    resultMask &= ~blockedPawnMask;
    const opponentPawnMask = board.getPawnMask(BLACK);
    const opponentPawnDefenseMask =
      ((opponentPawnMask >> 7) & leftBorderMask) |
      ((opponentPawnMask >> 9) & rightBorderMask);
    resultMask &= ~opponentPawnDefenseMask;
  } else {
    const blockedPawnMask =
      board.getPawnMask(BLACK) &
      ((firstColMask << 40) | (firstColMask << 48) | (allMask << 8));
    resultMask &= ~blockedPawnMask;
    const opponentPawnMask = board.getPawnMask(WHITE);
    const opponentPawnDefenseMask =
      ((opponentPawnMask << 7) & rightBorderMask) |
      ((opponentPawnMask << 9) & leftBorderMask);
    resultMask &= ~opponentPawnDefenseMask;
  }
  return resultMask;
}

export function mobilityArea(
  board: BitBoard,
  player: i8,
  position: i8
): boolean {
  const positionMask = (<u64>1) << position;
  return !!(mobilityAreaMask(board, player) & positionMask);
}
