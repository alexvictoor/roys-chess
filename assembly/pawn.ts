import {
  BISHOP,
  Board,
  KNIGHT,
  MoveOutcome,
  opponent,
  PAWN,
  PieceOnBoard,
  Position,
  positionOnBoard,
  QUEEN,
  ROOK,
  WHITE,
} from "./chess";

const enPassantRow = (color: i8): i8 => (color === WHITE ? <i8>3 : <i8>4);

const removeOccupiedPositions = (
  board: Board,
  positions: MoveOutcome[]
): MoveOutcome[] => {
  const result: MoveOutcome[] = [];
  for (let index = 0; index < positions.length; index++) {
    const p = positions[index];
    if (board.playerAt(p) === -1) {
      result.push(p);
    }
  }
  return result;
};

export const pawnPseudoLegalMoves = (
  board: Board,
  pieceOnBoard: PieceOnBoard
): MoveOutcome[] => {
  const position = pieceOnBoard.position;
  const color = pieceOnBoard.color;
  const x = position.x;
  const y = position.y;
  let positions: MoveOutcome[] = [];
  const opponentPlayer = opponent(pieceOnBoard.color);

  const lastRowBeforePromotion = color === WHITE ? <i8>1 : <i8>6;
  const direction = color === WHITE ? <i8>-1 : <i8>1;

  const nextSquare: MoveOutcome = {
    x,
    y: y + direction,
    captureEnPassant: null,
    capturedPiece: -1,
    promoteTo: -1,
  };
  if (y === lastRowBeforePromotion) {
    positions.push({
      x,
      y: y + direction,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: QUEEN,
    });
    positions.push({
      x,
      y: y + direction,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: ROOK,
    });
    positions.push({
      x,
      y: y + direction,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: BISHOP,
    });
    positions.push({
      x,
      y: y + direction,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: KNIGHT,
    });
  } else {
    positions.push(nextSquare);
  }

  const pawnOnInitialPosition =
    color === WHITE ? position.y === 6 : position.y === 1;
  if (pawnOnInitialPosition && board.playerAt(nextSquare) === -1) {
    positions.push({
      x,
      y: y + direction * 2,
      promoteTo: -1,
      captureEnPassant: null,
      capturedPiece: -1,
    });
  }

  positions = removeOccupiedPositions(board, positions);

  const forwardOnTheRight: Position = { x: x + 1, y: y + direction };
  if (positionOnBoard(forwardOnTheRight)) {
    const playerOnTheRight = board.playerAt(forwardOnTheRight);
    if (playerOnTheRight === opponentPlayer) {
      const capturedPiece = board.pieceAt(forwardOnTheRight);
      if (y === lastRowBeforePromotion) {
        positions.push({
          x: forwardOnTheRight.x,
          y: forwardOnTheRight.y,
          capturedPiece,
          promoteTo: QUEEN,
          captureEnPassant: null,
        });
        positions.push({
          x: forwardOnTheRight.x,
          y: forwardOnTheRight.y,
          capturedPiece,
          promoteTo: ROOK,
          captureEnPassant: null,
        });
        positions.push({
          x: forwardOnTheRight.x,
          y: forwardOnTheRight.y,
          capturedPiece,
          promoteTo: BISHOP,
          captureEnPassant: null,
        });
        positions.push({
          x: forwardOnTheRight.x,
          y: forwardOnTheRight.y,
          capturedPiece,
          promoteTo: KNIGHT,
          captureEnPassant: null,
        });
      } else {
        positions.push({
          x: forwardOnTheRight.x,
          y: forwardOnTheRight.y,
          capturedPiece,
          captureEnPassant: null,
          promoteTo: -1,
        });
      }
    }
  }

  const forwardOnTheLeft: Position = { x: x - 1, y: y + direction };
  if (positionOnBoard(forwardOnTheLeft)) {
    const playerOnTheLeft = board.playerAt(forwardOnTheLeft);
    if (playerOnTheLeft === opponentPlayer) {
      const capturedPiece = board.pieceAt(forwardOnTheLeft);
      if (y === lastRowBeforePromotion) {
        positions.push({
          x: forwardOnTheLeft.x,
          y: forwardOnTheLeft.y,
          capturedPiece,
          promoteTo: QUEEN,
          captureEnPassant: null,
        });
        positions.push({
          x: forwardOnTheLeft.x,
          y: forwardOnTheLeft.y,
          capturedPiece,
          promoteTo: ROOK,
          captureEnPassant: null,
        });
        positions.push({
          x: forwardOnTheLeft.x,
          y: forwardOnTheLeft.y,
          capturedPiece,
          promoteTo: BISHOP,
          captureEnPassant: null,
        });
        positions.push({
          x: forwardOnTheLeft.x,
          y: forwardOnTheLeft.y,
          capturedPiece,
          promoteTo: KNIGHT,
          captureEnPassant: null,
        });
      } else {
        positions.push({
          x: forwardOnTheLeft.x,
          y: forwardOnTheLeft.y,
          capturedPiece,
          captureEnPassant: null,
          promoteTo: -1,
        });
      }
    }
  }

  if (
    board.enPassantFile !== -1 &&
    y === enPassantRow(color) &&
    Math.abs(board.enPassantFile - position.x) === 1
  ) {
    positions.push({
      x: board.enPassantFile,
      y: y + direction,
      captureEnPassant: {
        position: {
          x: board.enPassantFile,
          y,
        },
        piece: PAWN,
        color: opponent(color),
      },
      promoteTo: -1,
      capturedPiece: PAWN,
    });
  }

  return positions;
};
