import {
  Board,
  MoveOutcome,
  opponent,
  PieceOnBoard,
  Position,
  positionOnBoard,
} from "./chess";

export const knightPseudoLegalMoves = (
  board: Board,
  pieceOnBoard: PieceOnBoard
): MoveOutcome[] => {
  const { position } = pieceOnBoard;
  const { x, y } = position;
  const positions: Position[] = [];

  positions.push({ x: x - 2, y: y - 1 });
  positions.push({ x: x - 2, y: y + 1 });
  positions.push({ x: x + 2, y: y - 1 });
  positions.push({ x: x + 2, y: y + 1 });
  positions.push({ x: x - 1, y: y - 2 });
  positions.push({ x: x + 1, y: y - 2 });
  positions.push({ x: x - 1, y: y + 2 });
  positions.push({ x: x + 1, y: y + 2 });

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
