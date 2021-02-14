/*export type PieceName =
  | "Pawn"
  | "Knight"
  | "Bishop"
  | ROOK
  | "Queen"
  | "King";
*/
//export type PieceType = i8;
export const PAWN: i8 = 0;
export const KNIGHT: i8 = 1;
export const BISHOP: i8 = 2;
export const ROOK: i8 = 3;
export const QUEEN: i8 = 4;
export const KING: i8 = 5;

export const WHITE: i8 = 0;
export const BLACK: i8 = 1;

export class Position {
  x: i8;
  y: i8;
}
export class Piece {
  piece: i8;
  color: i8;
}

export class PieceOnBoard extends Piece {
  position: Position;
}

export class MoveOutcome extends Position {
  promoteTo: i8;
  captureEnPassant: PieceOnBoard | null;
  capturedPiece: i8;

  /*@operator("==")
  equals(other: MoveOutcome): bool {
    return (
      this.x === other.x &&
      this.y === other.y &&
      this.promoteTo === other.promoteTo
    );
  }*/
}

export const positionOnBoard = (pos: Position): boolean =>
  pos.x >= 0 && pos.y >= 0 && pos.x < 8 && pos.y < 8;

//export type Player = "White" | BLACK;

export const opponent = (player: i8): i8 => (player === WHITE ? BLACK : WHITE);

export const equalPositions = (p1: Position, p2: Position): boolean =>
  p1.x === p2.x && p1.y === p2.y;

export const isQueenSideRook = (piece: PieceOnBoard): boolean => {
  const y = piece.color === BLACK ? <i8>0 : <i8>7;
  return piece.piece === ROOK && equalPositions(piece.position, { x: 0, y });
};

export const isKingSideRook = (piece: PieceOnBoard): boolean => {
  const y = piece.color === BLACK ? <i8>0 : <i8>7;
  return piece.piece === ROOK && equalPositions(piece.position, { x: 7, y });
};

export class CastlingRights {
  WhiteKingSide: bool;
  WhiteQueenSide: bool;
  BlackKingSide: bool;
  BlackQueenSide: bool;
}

export const initialCastlingRights: CastlingRights = {
  WhiteKingSide: true,
  WhiteQueenSide: true,
  BlackKingSide: true,
  BlackQueenSide: true,
};

export interface Board {
  readonly enPassantFile: i8;
  readonly halfMoveClock: i8;

  getKing(player: i8): PieceOnBoard;

  getPlayerPieces(player: i8): PieceOnBoard[];

  getAt(pos: Position): PieceOnBoard | null;
  playerAt(pos: Position): i8;
  pieceAt(pos: Position): i8;

  move(piece: PieceOnBoard, to: MoveOutcome): Board;

  queenSideCastlingRight(player: i8): bool;
  kingSideCastlingRight(player: i8): bool;
}

export type BoardFactory = (
  pieces: PieceOnBoard[],
  clock?: number,
  rights?: CastlingRights
) => Board;
