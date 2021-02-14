import { bishopPseudoLegalMoves } from "./bishop";
import { Board, MoveOutcome, PieceOnBoard } from "./chess";
import { rookPseudoLegalMoves } from "./rook";

export const queenPseudoLegalMoves = (
  board: Board,
  pieceOnBoard: PieceOnBoard
): MoveOutcome[] => {
  return rookPseudoLegalMoves(board, pieceOnBoard).concat(
    bishopPseudoLegalMoves(board, pieceOnBoard)
  );
};
