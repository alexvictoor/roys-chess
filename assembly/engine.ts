import { bishopPseudoLegalMoves } from "./bishop";
//import { castlingMoves } from "./castling";
import {
  BISHOP,
  BLACK,
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
export class Move {
  pieceOnBoard: PieceOnBoard;
  to: MoveOutcome;
  board: Board;
}

export const legalMoves = (player: i8, currentBoard: Board): Move[] => {
  const pieces = currentBoard.getPlayerPieces(player);
  const result: Move[] = [];
  for (let index = 0; index < pieces.length; index++) {
    const p = unchecked(pieces[index]);
    const outcomes = pseudoLegalMoves(currentBoard, p);
    for (let j = 0; j < outcomes.length; j++) {
      const to = unchecked(outcomes[j]);
      const board = currentBoard.move(p, to);
      if (!isInCheck(player, board)) {
        result.push({
          to,
          pieceOnBoard: p,
          board,
        });
      }
    }
  }

  return result.concat(castlingMoves(player, currentBoard));
};

export function isInCheck(player: i8, board: Board): boolean {
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
}

export function kingSideCastlingMoves(player: i8, currentBoard: Board): Move[] {
  if (!currentBoard.kingSideCastlingRight(player)) {
    return [];
  }

  const y = player === BLACK ? <i8>0 : <i8>7;
  const king = currentBoard.getKing(player);
  const kingSideRook = currentBoard.getAt({ x: 7, y });

  if (
    !kingSideRook ||
    currentBoard.getAt({ x: 5, y }) ||
    currentBoard.getAt({ x: 6, y })
  ) {
    return [];
  }

  const intermediateBoard = currentBoard.move(king, {
    x: 5,
    y,
    capturedPiece: -1,
    captureEnPassant: null,
    promoteTo: -1,
  });

  if (isInCheck(player, intermediateBoard)) {
    return [];
  }

  const kingSideCastling = currentBoard
    .move(king, {
      x: 6,
      y,
      capturedPiece: -1,
      captureEnPassant: null,
      promoteTo: -1,
    })
    .move(kingSideRook, {
      x: 5,
      y,
      capturedPiece: -1,
      captureEnPassant: null,
      promoteTo: -1,
    });

  if (isInCheck(player, kingSideCastling)) {
    return [];
  }

  return [
    {
      pieceOnBoard: king,
      to: { x: 6, y, capturedPiece: -1, captureEnPassant: null, promoteTo: -1 },
      board: kingSideCastling,
    },
  ];
}

export function queenSideCastlingMoves(
  player: i8,
  currentBoard: Board
): Move[] {
  if (!currentBoard.queenSideCastlingRight(player)) {
    return [];
  }
  const y = player === BLACK ? <i8>0 : <i8>7;
  const king = currentBoard.getKing(player);
  const queenSideRook = currentBoard.getAt({ x: 0, y });

  if (
    !queenSideRook ||
    currentBoard.getAt({ x: <i8>1, y }) ||
    currentBoard.getAt({ x: <i8>2, y }) ||
    currentBoard.getAt({ x: <i8>3, y })
  ) {
    return [];
  }

  const intermediateBoard = currentBoard.move(king, {
    x: 3,
    y,
    capturedPiece: -1,
    captureEnPassant: null,
    promoteTo: -1,
  });
  if (isInCheck(player, intermediateBoard)) {
    return [];
  }

  const queenSideCastling = currentBoard
    .move(king, {
      x: 2,
      y,
      capturedPiece: -1,
      captureEnPassant: null,
      promoteTo: -1,
    })
    .move(queenSideRook, {
      x: 3,
      y,
      capturedPiece: -1,
      captureEnPassant: null,
      promoteTo: -1,
    });

  if (isInCheck(player, queenSideCastling)) {
    return [];
  }
  return [
    {
      pieceOnBoard: king,
      to: { x: 2, y, capturedPiece: -1, captureEnPassant: null, promoteTo: -1 },
      board: queenSideCastling,
    },
  ];
}

export function castlingMoves(player: i8, currentBoard: Board): Move[] {
  if (isInCheck(player, currentBoard)) {
    return [];
  }

  const moves = kingSideCastlingMoves(player, currentBoard).concat(
    queenSideCastlingMoves(player, currentBoard)
  );

  return moves;
}
