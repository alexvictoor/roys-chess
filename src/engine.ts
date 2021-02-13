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
      throw new Error("Unknown Piece " + pieceOnBoard.piece);
  }
};

/*export const isInCheck = (player: Player, board: Board): boolean => {
  const king = board.getKing(player);
  const opponentPlayer = opponent(player);
  const opponentPieces = board.getPlayerPieces(opponentPlayer);
  for (let index = 0; index < opponentPieces.length; index++) {
    const piece = opponentPieces[index];
    const checkFound = pseudoLegalMoves(board, piece).some((pos) =>
      equalPositions(pos, king.position)
    );
    if (checkFound) {
      return true;
    }
  }

  return false;
};*/

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
