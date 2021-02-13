import { Board, MoveOutcome, PieceOnBoard } from "./chess";

export const bishopPseudoLegalMoves = (
  board: Board,
  pieceOnBoard: PieceOnBoard
): MoveOutcome[] => {
  const { position, color } = pieceOnBoard;
  const { x, y } = position;
  const positions = [];

  for (let offset: number = 1; x - offset >= 0 && y - offset >= 0; offset++) {
    const newPosition: MoveOutcome = { x: x - offset, y: y - offset };
    const playerOnNewPosition = board.playerAt(newPosition);
    if (playerOnNewPosition) {
      if (playerOnNewPosition !== color) {
        newPosition.capturedPiece = board.pieceAt(newPosition);
        positions.push(newPosition);
      }
      break;
    }
    positions.push(newPosition);
  }
  for (let offset: number = 1; x + offset < 8 && y - offset >= 0; offset++) {
    const newPosition: MoveOutcome = { x: x + offset, y: y - offset };
    const playerOnNewPosition = board.playerAt(newPosition);
    if (playerOnNewPosition) {
      if (playerOnNewPosition !== color) {
        newPosition.capturedPiece = board.pieceAt(newPosition);
        positions.push(newPosition);
      }
      break;
    }
    positions.push(newPosition);
  }
  for (let offset: number = 1; x + offset < 8 && y + offset < 8; offset++) {
    const newPosition: MoveOutcome = { x: x + offset, y: y + offset };
    const playerOnNewPosition = board.playerAt(newPosition);
    if (playerOnNewPosition) {
      if (playerOnNewPosition !== color) {
        newPosition.capturedPiece = board.pieceAt(newPosition);
        positions.push(newPosition);
      }
      break;
    }
    positions.push(newPosition);
  }
  for (let offset: number = 1; x - offset >= 0 && y + offset < 8; offset++) {
    const newPosition: MoveOutcome = { x: x - offset, y: y + offset };
    const playerOnNewPosition = board.playerAt(newPosition);
    if (playerOnNewPosition) {
      if (playerOnNewPosition !== color) {
        newPosition.capturedPiece = board.pieceAt(newPosition);
        positions.push(newPosition);
      }
      break;
    }
    positions.push(newPosition);
  }
  return positions;
};
