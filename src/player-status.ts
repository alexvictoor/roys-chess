import { Board, Player } from "./chess";
import { legalMoves } from "./engine";
import { isInCheck } from "./king";

export const playerStatus = (
  player: Player,
  board: Board
): "Checkmate" | "Check" | "Draw" | "Safe" => {
  const check = isInCheck(player, board);
  const stale = legalMoves(player, board).length === 0;
  if (check && stale) {
    return "Checkmate";
  }
  if (check) {
    return "Check";
  }
  if (stale || board.halfMoveClock >= 100) {
    return "Draw";
  }
  return "Safe";
};
