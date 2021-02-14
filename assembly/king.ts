import {
  Board,
  MoveOutcome,
  opponent,
  PieceOnBoard,
  Position,
  positionOnBoard,
} from "./chess";

export const kingPseudoLegalMoves = (
  board: Board,
  pieceOnBoard: PieceOnBoard
): MoveOutcome[] => {
  const position = pieceOnBoard.position;
  const x = position.x;
  const y = position.y;
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
  const boardPositions = positions.filter((p) => positionOnBoard(p));
  const result: MoveOutcome[] = [];
  for (let index = 0; index < boardPositions.length; index++) {
    const p = boardPositions[index];
    const playerOnNewPosition = board.playerAt(p);

    if (playerOnNewPosition === opponentPlayer) {
      result.push({
        x: p.x,
        y: p.y,
        capturedPiece: board.pieceAt(p),
        promoteTo: -1,
        captureEnPassant: null,
      });
    } else if (playerOnNewPosition === -1) {
      result.push({
        x: p.x,
        y: p.y,
        capturedPiece: -1,
        promoteTo: -1,
        captureEnPassant: null,
      });
    }
  }
  return result;
};
