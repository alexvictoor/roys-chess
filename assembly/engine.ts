import { bishopPseudoLegalMoves } from "./bishop";
//import { castlingMoves } from "./castling";
import {
  BISHOP,
  Board,
  KING,
  KNIGHT,
  MoveOutcome,
  PAWN,
  PieceOnBoard,
  QUEEN,
  ROOK,
} from "./chess";
import { kingPseudoLegalMoves } from "./king";
import { knightPseudoLegalMoves } from "./knight";
import { pawnPseudoLegalMoves } from "./pawn";
import { queenPseudoLegalMoves } from "./queen";
import { rookPseudoLegalMoves } from "./rook";

const pseudoLegalMoves = (
  board: Board,
  pieceOnBoard: PieceOnBoard
): MoveOutcome[] => {
  switch (pieceOnBoard.piece) {
    case ROOK:
      return rookPseudoLegalMoves(board, pieceOnBoard);
    case BISHOP:
      return bishopPseudoLegalMoves(board, pieceOnBoard);
    case QUEEN:
      return queenPseudoLegalMoves(board, pieceOnBoard);
    case KNIGHT:
      return knightPseudoLegalMoves(board, pieceOnBoard);
    case PAWN:
      return pawnPseudoLegalMoves(board, pieceOnBoard);
    case KING:
      return kingPseudoLegalMoves(board, pieceOnBoard);
    default:
      throw new Error("Unknown Piece " + pieceOnBoard.piece.toString());
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

/*
export type Move = {
  pieceOnBoard: PieceOnBoard;
  to: MoveOutcome;
  board: Board;
};

export const legalMoves = (player: i8, currentBoard: Board): Move[] => {
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
};*/

export const isInCheck = (player: i8, board: Board): boolean => {
  const king = board.getKing(player);

  const checkedByRookOrQueen = rookPseudoLegalMoves(board, king).some(
    (p) => p.capturedPiece === ROOK || p.capturedPiece === QUEEN
  );
  if (checkedByRookOrQueen) {
    return true;
  }

  const checkedByBishopOrQueen = bishopPseudoLegalMoves(board, king).some(
    (p) => p.capturedPiece === BISHOP || p.capturedPiece === QUEEN
  );
  if (checkedByBishopOrQueen) {
    return true;
  }

  const checkedByKnight = knightPseudoLegalMoves(board, king).some(
    (p) => p.capturedPiece === KNIGHT
  );
  if (checkedByKnight) {
    return true;
  }

  const checkedByKing = kingPseudoLegalMoves(board, king).some(
    (p) => p.capturedPiece === KING
  );

  if (checkedByKing) {
    return true;
  }

  const checkedByPawn = pawnPseudoLegalMoves(board, king).some(
    (p) => p.capturedPiece === PAWN
  );

  if (checkedByPawn) {
    return true;
  }

  return false;
};
