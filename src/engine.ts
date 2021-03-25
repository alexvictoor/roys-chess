import { bishopPseudoLegalMoves } from "./bishop";
import { castlingMoves } from "./castling";
import { Board, MoveOutcome, PieceOnBoard, Player } from "./chess";
import { isInCheck, kingPseudoLegalMoves } from "./king";
import { knightPseudoLegalMoves } from "./knight";
import { pawnPseudoLegalMoves } from "./pawn";
import { queenPseudoLegalMoves } from "./queen";
import { rookPseudoLegalMoves } from "./rook";

const pseudoLegalMoves = (
  board: Board,
  pieceOnBoard: PieceOnBoard
): MoveOutcome[] => {
  switch (pieceOnBoard.piece) {
    case "Rook":
      return rookPseudoLegalMoves(board, pieceOnBoard);
    case "Bishop":
      return bishopPseudoLegalMoves(board, pieceOnBoard);
    case "Queen":
      return queenPseudoLegalMoves(board, pieceOnBoard);
    case "Knight":
      return knightPseudoLegalMoves(board, pieceOnBoard);
    case "Pawn":
      return pawnPseudoLegalMoves(board, pieceOnBoard);
    case "King":
      return kingPseudoLegalMoves(board, pieceOnBoard);
    default:
      return [];
  }
};

export type Move = {
  pieceOnBoard: PieceOnBoard;
  to: MoveOutcome;
  board: Board;
};

export const legalMoves = (player: Player, currentBoard: Board): Move[] => {
  const pieces = currentBoard.getPlayerPieces(player);
  const pseudo = pieces.flatMap((p) =>
    pseudoLegalMoves(currentBoard, p).map((to) => ({
      to,
      pieceOnBoard: p,
      board: currentBoard.move(p, to),
    }))
  );
  return pseudo
    .filter(({ board }) => {
      const c = isInCheck(player, board);
      return !c;
    })
    .concat(castlingMoves(player, currentBoard));
};
