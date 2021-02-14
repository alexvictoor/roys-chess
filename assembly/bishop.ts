import { Board, MoveOutcome, opponent, PieceOnBoard } from "./chess";

export const bishopPseudoLegalMoves = (
  board: Board,
  pieceOnBoard: PieceOnBoard
): MoveOutcome[] => {
  const position = pieceOnBoard.position;
  const color = pieceOnBoard.color;
  const opponentPlayer = opponent(color);
  const x = position.x;
  const y = position.y;
  const positions: MoveOutcome[] = [];

  for (let offset: i8 = 1; x - offset >= 0 && y - offset >= 0; offset++) {
    const newPosition: MoveOutcome = {
      x: x - offset,
      y: y - offset,
      capturedPiece: -1,
      promoteTo: -1,
      captureEnPassant: null,
    };
    const playerOnNewPosition = board.playerAt(newPosition);
    if (playerOnNewPosition === opponentPlayer) {
      newPosition.capturedPiece = board.pieceAt(newPosition);
      positions.push(newPosition);
    }
    if (playerOnNewPosition !== -1) {
      break;
    }

    positions.push(newPosition);
  }
  for (let offset: i8 = 1; x + offset < 8 && y - offset >= 0; offset++) {
    const newPosition: MoveOutcome = {
      x: x + offset,
      y: y - offset,
      capturedPiece: -1,
      promoteTo: -1,
      captureEnPassant: null,
    };
    const playerOnNewPosition = board.playerAt(newPosition);
    if (playerOnNewPosition === opponentPlayer) {
      newPosition.capturedPiece = board.pieceAt(newPosition);
      positions.push(newPosition);
    }
    if (playerOnNewPosition !== -1) {
      break;
    }

    positions.push(newPosition);
  }
  for (let offset: i8 = 1; x + offset < 8 && y + offset < 8; offset++) {
    const newPosition: MoveOutcome = {
      x: x + offset,
      y: y + offset,
      capturedPiece: -1,
      promoteTo: -1,
      captureEnPassant: null,
    };
    const playerOnNewPosition = board.playerAt(newPosition);
    if (playerOnNewPosition === opponentPlayer) {
      newPosition.capturedPiece = board.pieceAt(newPosition);
      positions.push(newPosition);
    }
    if (playerOnNewPosition !== -1) {
      break;
    }

    positions.push(newPosition);
  }
  for (let offset: i8 = 1; x - offset >= 0 && y + offset < 8; offset++) {
    const newPosition: MoveOutcome = {
      x: x - offset,
      y: y + offset,
      capturedPiece: -1,
      promoteTo: -1,
      captureEnPassant: null,
    };
    const playerOnNewPosition = board.playerAt(newPosition);
    if (playerOnNewPosition === opponentPlayer) {
      newPosition.capturedPiece = board.pieceAt(newPosition);
      positions.push(newPosition);
    }
    if (playerOnNewPosition !== -1) {
      break;
    }

    positions.push(newPosition);
  }
  return positions;
};
