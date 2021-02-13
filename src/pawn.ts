import {
  Board,
  MoveOutcome,
  opponent,
  PieceName,
  PieceOnBoard,
  Player,
  Position,
  positionOnBoard,
} from "./chess";

const enPassantRow = (color: Player) => (color === "White" ? 3 : 4);

export const pawnPseudoLegalMoves = (
  board: Board,
  pieceOnBoard: PieceOnBoard
): MoveOutcome[] => {
  const { position, color } = pieceOnBoard;
  const { x, y } = position;
  let positions: MoveOutcome[] = [];

  const lastRowBeforePromotion = color === "White" ? 1 : 6;
  const direction = color === "White" ? -1 : 1;

  const nextSquare: Position = { x, y: y + direction };
  if (y === lastRowBeforePromotion) {
    positions.push({ ...nextSquare, promoteTo: "Queen" });
    positions.push({ ...nextSquare, promoteTo: "Rook" });
    positions.push({ ...nextSquare, promoteTo: "Bishop" });
    positions.push({ ...nextSquare, promoteTo: "Knight" });
  } else {
    positions.push(nextSquare);
  }

  const pawnOnInitialPosition =
    color === "White" ? position.y === 6 : position.y === 1;
  if (pawnOnInitialPosition && !board.playerAt(nextSquare)) {
    positions.push({ x, y: y + direction * 2 });
  }

  positions = positions.filter((p) => !board.playerAt(p));

  const forwardOnTheRight = { x: x + 1, y: y + direction };
  if (positionOnBoard(forwardOnTheRight)) {
    const playerOnTheRight = board.playerAt(forwardOnTheRight);
    if (playerOnTheRight && playerOnTheRight !== pieceOnBoard.color) {
      const capturedPiece = board.pieceAt(forwardOnTheRight);
      if (y === lastRowBeforePromotion) {
        positions.push({
          ...forwardOnTheRight,
          capturedPiece,
          promoteTo: "Queen",
        });
        positions.push({
          ...forwardOnTheRight,
          capturedPiece,
          promoteTo: "Rook",
        });
        positions.push({
          ...forwardOnTheRight,
          capturedPiece,
          promoteTo: "Bishop",
        });
        positions.push({
          ...forwardOnTheRight,
          capturedPiece,
          promoteTo: "Knight",
        });
      } else {
        positions.push({ ...forwardOnTheRight, capturedPiece });
      }
    }
  }

  const forwardOnTheLeft = { x: x - 1, y: y + direction };
  if (positionOnBoard(forwardOnTheLeft)) {
    const playerOnTheLeft = board.playerAt(forwardOnTheLeft);
    if (playerOnTheLeft && playerOnTheLeft !== pieceOnBoard.color) {
      const capturedPiece = board.pieceAt(forwardOnTheLeft);
      if (y === lastRowBeforePromotion) {
        positions.push({
          ...forwardOnTheLeft,
          capturedPiece,
          promoteTo: "Queen",
        });
        positions.push({
          ...forwardOnTheLeft,
          capturedPiece,
          promoteTo: "Rook",
        });
        positions.push({
          ...forwardOnTheLeft,
          capturedPiece,
          promoteTo: "Bishop",
        });
        positions.push({
          ...forwardOnTheLeft,
          capturedPiece,
          promoteTo: "Knight",
        });
      } else {
        positions.push({ ...forwardOnTheLeft, capturedPiece });
      }
    }
  }

  if (
    typeof board.enPassantFile != "undefined" &&
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
        piece: "Pawn",
        color: opponent(color),
      },
    });
  }

  return positions;
};
