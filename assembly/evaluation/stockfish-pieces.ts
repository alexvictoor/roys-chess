import { BitBoard, opponent, toMask, WHITE } from "../bitboard";
import { backward } from "./stockfish-pawn";

export function pawnAttacksSpan(board: BitBoard, player: i8, pos: i8): i16 {
  const pawnMask = board.getPawnMask(player);
  const opponentPawnMask = board.getPawnMask(opponent(player));
  const posX: i8 = pos % 8;
  const posY: i8 = pos >> 3;
  const forwardDirection: i8 = player === WHITE ? 1 : -1;
  const lastRow: i8 = player === WHITE ? 7 : 0;
  for (let y: i8 = lastRow; y != posY; y -= forwardDirection) {
    if (
      posX > 0 &&
      toMask(posX - 1, y) & opponentPawnMask &&
      (y == posY + forwardDirection ||
        (!(toMask(posX - 1, y - forwardDirection) & pawnMask) &&
          !backward(board, opponent(player), ((7 - y) << 3) + posX - 1)))
    ) {
      return <i16>1;
    }
    if (
      posX < 7 &&
      toMask(posX + 1, y) & opponentPawnMask &&
      (y == posY + forwardDirection ||
        (!(toMask(posX + 1, y - forwardDirection) & pawnMask) &&
          !backward(board, opponent(player), ((7 - y) << 3) + posX + 1)))
    ) {
      return <i16>1;
    }
  }
  return <i16>0;
}
