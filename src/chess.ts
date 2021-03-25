export type PieceName =
  | "Pawn"
  | "Knight"
  | "Bishop"
  | "Rook"
  | "Queen"
  | "King";

export type Position = {
  x: number;
  y: number;
};

export type MoveOutcome = {
  promoteTo?: PieceName;
  captureEnPassant?: PieceOnBoard;
  capturedPiece?: PieceName;
} & Position;

export const positionOnBoard = ({ x, y }: Position) =>
  x >= 0 && y >= 0 && x < 8 && y < 8;

export type Player = "White" | "Black";

export const opponent = (player: Player) =>
  player === "White" ? "Black" : "White";

export type Piece = {
  piece: PieceName;
  color: Player;
};

export type PieceOnBoard = Piece & {
  position: Position;
};

export const equalPositions = (p1: Position, p2: Position) =>
  p1.x === p2.x && p1.y === p2.y;

export const isQueenSideRook = (piece: PieceOnBoard) => {
  const y = piece.color === "Black" ? 0 : 7;
  return piece.piece === "Rook" && equalPositions(piece.position, { x: 0, y });
};

export const isKingSideRook = (piece: PieceOnBoard) => {
  const y = piece.color === "Black" ? 0 : 7;
  return piece.piece === "Rook" && equalPositions(piece.position, { x: 7, y });
};

export type CastlingRights = {
  WhiteKingSide: boolean;
  WhiteQueenSide: boolean;
  BlackKingSide: boolean;
  BlackQueenSide: boolean;
};

export const initialCastlingRights = {
  WhiteKingSide: true,
  WhiteQueenSide: true,
  BlackKingSide: true,
  BlackQueenSide: true,
};

export interface Board {
  readonly enPassantFile?: number;
  readonly halfMoveClock: number;

  getKing(player: Player): PieceOnBoard;

  getPlayerPieces(player: Player): PieceOnBoard[];

  getAt(pos: Position): PieceOnBoard | void;
  playerAt(pos: Position): Player | void;
  pieceAt(pos: Position): PieceName;

  move(piece: PieceOnBoard, to: MoveOutcome): Board;

  queenSideCastlingRight(player: Player): boolean;
  kingSideCastlingRight(player: Player): boolean;
  toFEN(): string;
}

export type BoardFactory = (
  pieces: PieceOnBoard[],
  clock?: number,
  rights?: CastlingRights
) => Board;
