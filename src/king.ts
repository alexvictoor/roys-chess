import { bishopPseudoLegalMoves } from "./bishop";
import {
  Board,
  MoveOutcome,
  opponent,
  PieceOnBoard,
  Player,
  Position,
  positionOnBoard,
} from "./chess";
import { knightPseudoLegalMoves } from "./knight";
import { pawnPseudoLegalMoves } from "./pawn";
import { rookPseudoLegalMoves } from "./rook";

export const kingPseudoLegalMoves = (
  board: Board,
  pieceOnBoard: PieceOnBoard
): MoveOutcome[] => {
  const { position } = pieceOnBoard;
  const { x, y } = position;
  const positions: Position[] = [];

  positions.push({ x: x - 1, y: y - 1 });
  positions.push({ x, y: y - 1 });
  positions.push({ x: x + 1, y: y - 1 });
  positions.push({ x: x - 1, y });
  positions.push({ x: x + 1, y });
  positions.push({ x: x - 1, y: y + 1 });
  positions.push({ x, y: y + 1 });
  positions.push({ x: x + 1, y: y + 1 });

  const opponentPlayer = opponent(pieceOnBoard.color);

  return positions
    .filter(positionOnBoard)
    .reduce<MoveOutcome[]>((result, p) => {
      const playerOnNewPosition = board.playerAt(p);
      if (playerOnNewPosition === opponentPlayer) {
        result.push({ ...p, capturedPiece: board.pieceAt(p) });
      } else if (!playerOnNewPosition) {
        result.push(p);
      }
      return result;
    }, []);
};

export const isInCheck = (player: Player, board: Board): boolean => {
  const king = board.getKing(player);

  const checkedByRookOrQueen = rookPseudoLegalMoves(board, king).some(
    (p) => p.capturedPiece === "Rook" || p.capturedPiece === "Queen"
  );
  if (checkedByRookOrQueen) {
    return true;
  }

  const checkedByBishopOrQueen = bishopPseudoLegalMoves(board, king).some(
    (p) => p.capturedPiece === "Bishop" || p.capturedPiece === "Queen"
  );
  if (checkedByBishopOrQueen) {
    return true;
  }

  const checkedByKnight = knightPseudoLegalMoves(board, king).some(
    (p) => p.capturedPiece === "Knight"
  );
  if (checkedByKnight) {
    return true;
  }

  const checkedByKing = kingPseudoLegalMoves(board, king).some(
    (p) => p.capturedPiece === "King"
  );

  if (checkedByKing) {
    return true;
  }

  const checkedByPawn = pawnPseudoLegalMoves(board, king).some(
    (p) => p.capturedPiece === "Pawn"
  );

  if (checkedByPawn) {
    return true;
  }

  return false;
};
