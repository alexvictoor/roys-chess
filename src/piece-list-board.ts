import {
  Board,
  CastlingRights,
  equalPositions,
  initialCastlingRights,
  isKingSideRook,
  isQueenSideRook,
  MoveOutcome,
  PieceName,
  PieceOnBoard,
  Player,
  Position,
} from "./chess";

export class PieceListBoard implements Board {
  constructor(
    public pieces: PieceOnBoard[],
    public halfMoveClock: number = 0,
    public castlingRights: CastlingRights = initialCastlingRights,
    public enPassantFile?: number
  ) {
    this.move.bind(this);
    this.getAt.bind(this);
  }

  queenSideCastlingRight(player: Player): boolean {
    return this.castlingRights[player + "QueenSide"];
  }
  kingSideCastlingRight(player: Player): boolean {
    return this.castlingRights[player + "KingSide"];
  }

  getKing(player: Player): PieceOnBoard {
    return this.pieces.find((p) => p.color === player && p.piece === "King");
  }

  getPlayerPieces(player: Player): PieceOnBoard[] {
    return this.pieces.filter((p) => p.color === player);
  }

  getAt(pos: Position) {
    const foundPiece = this.pieces.find((p) => equalPositions(p.position, pos));
    if (!foundPiece) {
      return;
    }
    return foundPiece;
  }
  playerAt(pos: Position): Player | void {
    return this.getAt(pos)?.color;
  }
  pieceAt(pos: Position): PieceName {
    return this.getAt(pos)?.piece;
  }

  move(piece: PieceOnBoard, to: MoveOutcome): PieceListBoard {
    const lastRow = piece.color === "White" ? 0 : 7;
    const updatedPieces = this.pieces
      .filter((p) => !equalPositions(p.position, to))
      .filter(
        (p) =>
          !to.captureEnPassant ||
          !equalPositions(p.position, to.captureEnPassant.position)
      )
      .map((p) => {
        if (equalPositions(p.position, piece.position)) {
          if (piece.piece === "Pawn" && to.y === lastRow) {
            return {
              piece: to.promoteTo,
              color: p.color,
              position: { x: to.x, y: to.y },
            };
          }
          return {
            piece: p.piece,
            color: p.color,
            position: to,
          };
        }
        return p;
      });
    if (piece.piece === "Pawn") {
      if (Math.abs(piece.position.y - to.y) === 2) {
        // en passant will be possible
        // next turn
        return new PieceListBoard(
          updatedPieces,
          0,
          this.castlingRights,
          piece.position.x
        );
      }
    }
    if (piece.piece === "King") {
      return new PieceListBoard(updatedPieces, this.halfMoveClock + 1, {
        ...this.castlingRights,
        [piece.color + "KingSide"]: false,
        [piece.color + "QueenSide"]: false,
      });
    }
    if (isKingSideRook(piece)) {
      return new PieceListBoard(updatedPieces, this.halfMoveClock + 1, {
        ...this.castlingRights,
        [piece.color + "KingSide"]: false,
      });
    }
    if (isQueenSideRook(piece)) {
      return new PieceListBoard(updatedPieces, this.halfMoveClock + 1, {
        ...this.castlingRights,
        [piece.color + "QueenSide"]: false,
      });
    }
    return new PieceListBoard(
      updatedPieces,
      this.halfMoveClock + 1,
      this.castlingRights
    );
  }

  toString() {
    let result = "\n   A B C D E F G H \n\n";
    for (let y = 0; y < 8; y++) {
      result += String(8 - y) + " ";
      for (let x = 0; x < 8; x++) {
        result += " ";
        const p = this.getAt({ x, y });
        if (p) {
          const letter = p.piece === "Knight" ? "N" : p.piece[0];
          if (p.color === "White") {
            result += letter.toLocaleUpperCase();
          } else {
            result += letter.toLocaleLowerCase();
          }
        } else {
          result += ".";
        }
      }
      result += "\n\n";
    }
    return result;
  }
}

export const initialBoard = new PieceListBoard([
  { piece: "Rook", color: "Black", position: { x: 0, y: 0 } },
  { piece: "Knight", color: "Black", position: { x: 1, y: 0 } },
  { piece: "Bishop", color: "Black", position: { x: 2, y: 0 } },
  { piece: "Queen", color: "Black", position: { x: 3, y: 0 } },
  { piece: "King", color: "Black", position: { x: 4, y: 0 } },
  { piece: "Bishop", color: "Black", position: { x: 5, y: 0 } },
  { piece: "Knight", color: "Black", position: { x: 6, y: 0 } },
  { piece: "Rook", color: "Black", position: { x: 7, y: 0 } },
  { piece: "Pawn", color: "Black", position: { x: 0, y: 1 } },
  { piece: "Pawn", color: "Black", position: { x: 1, y: 1 } },
  { piece: "Pawn", color: "Black", position: { x: 2, y: 1 } },
  { piece: "Pawn", color: "Black", position: { x: 3, y: 1 } },
  { piece: "Pawn", color: "Black", position: { x: 4, y: 1 } },
  { piece: "Pawn", color: "Black", position: { x: 5, y: 1 } },
  { piece: "Pawn", color: "Black", position: { x: 6, y: 1 } },
  { piece: "Pawn", color: "Black", position: { x: 7, y: 1 } },
  { piece: "Pawn", color: "White", position: { x: 0, y: 6 } },
  { piece: "Pawn", color: "White", position: { x: 1, y: 6 } },
  { piece: "Pawn", color: "White", position: { x: 2, y: 6 } },
  { piece: "Pawn", color: "White", position: { x: 3, y: 6 } },
  { piece: "Pawn", color: "White", position: { x: 4, y: 6 } },
  { piece: "Pawn", color: "White", position: { x: 5, y: 6 } },
  { piece: "Pawn", color: "White", position: { x: 6, y: 6 } },
  { piece: "Pawn", color: "White", position: { x: 7, y: 6 } },
  { piece: "Rook", color: "White", position: { x: 0, y: 7 } },
  { piece: "Knight", color: "White", position: { x: 1, y: 7 } },
  { piece: "Bishop", color: "White", position: { x: 2, y: 7 } },
  { piece: "Queen", color: "White", position: { x: 3, y: 7 } },
  { piece: "King", color: "White", position: { x: 4, y: 7 } },
  { piece: "Bishop", color: "White", position: { x: 5, y: 7 } },
  { piece: "Knight", color: "White", position: { x: 6, y: 7 } },
  { piece: "Rook", color: "White", position: { x: 7, y: 7 } },
]);
