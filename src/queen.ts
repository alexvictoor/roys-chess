import { bishopPseudoLegalMoves } from "./bishop";
import { Board, PieceOnBoard, Position } from "./chess";
import { rookPseudoLegalMoves } from "./rook";

export const queenPseudoLegalMoves = (
  board: Board,
  pieceOnBoard: PieceOnBoard
): Position[] => {
  return rookPseudoLegalMoves(board, pieceOnBoard).concat(
    bishopPseudoLegalMoves(board, pieceOnBoard)
  );
};
