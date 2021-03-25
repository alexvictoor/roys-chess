import { Bits, indexToPosition, positionToIndex } from "./bits";
import {
  Board,
  CastlingRights,
  initialCastlingRights,
  isKingSideRook,
  isQueenSideRook,
  MoveOutcome,
  PieceName,
  PieceOnBoard,
  Player,
  Position,
} from "./chess";
export class BitBoard implements Board {
  constructor(
    private whiteBits = new Bits(),
    private blackBits = new Bits(),
    private kingBits = new Bits(),
    private queenBits = new Bits(),
    private rookBits = new Bits(),
    private bishopBits = new Bits(),
    private knightBits = new Bits(),
    private pawnBits = new Bits(),
    private extraBits = new Bits(),
    private clock: number = 0
  ) {
    this.move.bind(this);
    this.getAt.bind(this);
    this.getPieceBits.bind(this);
    this.putPieceOnBoard.bind(this);
  }

  clone(): BitBoard {
    const clone = new BitBoard(
      this.whiteBits.clone(),
      this.blackBits.clone(),
      this.kingBits.clone(),
      this.queenBits.clone(),
      this.rookBits.clone(),
      this.bishopBits.clone(),
      this.knightBits.clone(),
      this.pawnBits.clone(),
      this.extraBits.clone(),
      this.clock
    );

    return clone;
  }

  get enPassantFile() {
    const it = this.extraBits.iterator();
    for (let index = 0; index < 8; index++) {
      if (it.next()) {
        return index;
      }
    }
    return;
  }

  get halfMoveClock() {
    return this.clock;
  }

  private setEnPassantFile(file: number) {
    for (let index = 0; index < 8; index++) {
      this.extraBits.set(index, file === index);
    }
  }
  private resetEnPassantFile() {
    for (let index = 0; index < 8; index++) {
      this.extraBits.set(index, false);
    }
  }

  static buildFromPieces(
    pieces: PieceOnBoard[],
    halfMoveClock: number = 0,
    castlingRights: CastlingRights = initialCastlingRights,
    enPassantFile?: number
  ): BitBoard {
    const board = new BitBoard();
    if (!castlingRights.WhiteKingSide) {
      board.removeKingSideCastlingRight("White");
    }
    if (!castlingRights.WhiteQueenSide) {
      board.removeQueenSideCastlingRight("White");
    }
    if (!castlingRights.BlackKingSide) {
      board.removeKingSideCastlingRight("Black");
    }
    if (!castlingRights.BlackQueenSide) {
      board.removeQueenSideCastlingRight("Black");
    }
    pieces.forEach((p) => board.putPieceOnBoard(p, true));
    board.setEnPassantFile(enPassantFile);
    board.clock = halfMoveClock;
    return board;
  }

  queenSideCastlingRight(player: Player): boolean {
    const bitPosition = player === "White" ? 10 : 11;
    return !this.extraBits.get(bitPosition);
  }
  removeQueenSideCastlingRight(player: Player) {
    const bitPosition = player === "White" ? 10 : 11;
    this.extraBits.set(bitPosition, true);
  }
  kingSideCastlingRight(player: Player): boolean {
    const bitPosition = player === "White" ? 8 : 9;
    return !this.extraBits.get(bitPosition);
  }
  removeKingSideCastlingRight(player: Player) {
    const bitPosition = player === "White" ? 8 : 9;
    return this.extraBits.set(bitPosition, true);
  }

  putPieceOnBoard(p: PieceOnBoard, onBoard: boolean) {
    const bits = this.getPieceBits(p.piece);
    bits.setAtPosition(p.position, onBoard);
    if (p.color === "White") {
      this.whiteBits.setAtPosition(p.position, onBoard);
    } else {
      this.blackBits.setAtPosition(p.position, onBoard);
    }
  }

  getPieceBits(name: PieceName) {
    switch (name) {
      case "King":
        return this.kingBits;
      case "Queen":
        return this.queenBits;
      case "Rook":
        return this.rookBits;
      case "Bishop":
        return this.bishopBits;
      case "Knight":
        return this.knightBits;
      case "Pawn":
        return this.pawnBits;
    }
  }

  playerBits(player: Player) {
    return player === "White" ? this.whiteBits : this.blackBits;
  }

  getKing(player: Player): PieceOnBoard {
    return {
      color: player,
      piece: "King",
      position: this.playerBits(player)
        .and(this.kingBits)
        .getFirstBitPosition(),
    };
  }

  getPieces(player: Player, name: PieceName): PieceOnBoard[] {
    return this.playerBits(player)
      .and(this.getPieceBits(name))
      .getPositions()
      .map((position) => ({
        color: player,
        piece: name,
        position,
      }));
  }

  getPlayerPieces(player: Player): PieceOnBoard[] {
    const playerBits = this.playerBits(player);
    const kingIt = this.kingBits.and(playerBits).iterator();
    const queenIt = this.queenBits.and(playerBits).iterator();
    const rookIt = this.rookBits.and(playerBits).iterator();
    const bishopIt = this.bishopBits.and(playerBits).iterator();
    const knightIt = this.knightBits.and(playerBits).iterator();
    const pawnIt = this.pawnBits.and(playerBits).iterator();

    const pieces: PieceOnBoard[] = [];
    for (let index = 0; index < 64; index++) {
      if (kingIt.next()) {
        pieces.push({
          color: player,
          piece: "King",
          position: indexToPosition(index),
        });
      }
      if (queenIt.next()) {
        pieces.push({
          color: player,
          piece: "Queen",
          position: indexToPosition(index),
        });
      }
      if (rookIt.next()) {
        pieces.push({
          color: player,
          piece: "Rook",
          position: indexToPosition(index),
        });
      }
      if (bishopIt.next()) {
        pieces.push({
          color: player,
          piece: "Bishop",
          position: indexToPosition(index),
        });
      }
      if (knightIt.next()) {
        pieces.push({
          color: player,
          piece: "Knight",
          position: indexToPosition(index),
        });
      }
      if (pawnIt.next()) {
        pieces.push({
          color: player,
          piece: "Pawn",
          position: indexToPosition(index),
        });
      }
    }
    return pieces;
  }

  /*getPlayerPiecesX(player: Player): PieceOnBoard[] {
    const pieceNames: PieceName[] = [
      "King",
      "Queen",
      "Rook",
      "Bishop",
      "Knight",
      "Pawn",
    ];
    return pieceNames
      .map((pieceName) => this.getPieces(player, pieceName))
      .flat();
  }*/

  playerAt(pos: Position): Player | void {
    if (this.whiteBits.getAtPosition(pos)) {
      return "White";
    }
    if (this.blackBits.getAtPosition(pos)) {
      return "Black";
    }
    return;
  }

  pieceAt(pos: Position): PieceName {
    const index = positionToIndex(pos);

    if (this.pawnBits.get(index)) {
      return "Pawn";
    }
    if (this.rookBits.get(index)) {
      return "Rook";
    }
    if (this.bishopBits.get(index)) {
      return "Bishop";
    }
    if (this.knightBits.get(index)) {
      return "Knight";
    }
    if (this.kingBits.get(index)) {
      return "King";
    }
    if (this.queenBits.get(index)) {
      return "Queen";
    }
    throw new Error("No piece found");
  }

  getAt(pos: Position) {
    const color = this.playerAt(pos);
    if (!color) {
      return;
    }
    return {
      color,
      position: pos,
      piece: this.pieceAt(pos),
    };
  }

  move(piece: PieceOnBoard, to: MoveOutcome): BitBoard {
    const boardUpdated = this.clone();
    boardUpdated.resetEnPassantFile();
    const pieceToRemove = boardUpdated.getAt(to);
    if (pieceToRemove) {
      boardUpdated.putPieceOnBoard(pieceToRemove, false);
    }
    if (to.captureEnPassant) {
      boardUpdated.putPieceOnBoard(to.captureEnPassant, false);
    }
    boardUpdated.putPieceOnBoard(piece, false);

    const updatedPiece = {
      ...piece,
      position: to,
    };

    if (piece.piece === "Pawn") {
      const lastRow = piece.color === "White" ? 0 : 7;
      if (to.y === lastRow) {
        updatedPiece.piece = to.promoteTo;
      } else if (Math.abs(piece.position.y - to.y) === 2) {
        // en passant will be possible
        // next turn
        boardUpdated.setEnPassantFile(piece.position.x);
      }
    } else if (piece.piece === "King") {
      boardUpdated.removeKingSideCastlingRight(piece.color);
      boardUpdated.removeQueenSideCastlingRight(piece.color);
    } else if (isKingSideRook(piece)) {
      boardUpdated.removeKingSideCastlingRight(piece.color);
    } else if (isQueenSideRook(piece)) {
      boardUpdated.removeQueenSideCastlingRight(piece.color);
    }

    boardUpdated.putPieceOnBoard(updatedPiece, true);

    boardUpdated.clock++;
    return boardUpdated;
  }

  toFEN() {
    let result = "";
    for (let y = 0; y < 8; y++) {
      let emptySquares = 0;
      for (let x = 0; x < 8; x++) {
        const p = this.getAt({ x, y });
        if (p) {
          if (emptySquares) {
            result += emptySquares;
            emptySquares = 0;
          }
          const letter = p.piece === "Knight" ? "N" : p.piece[0];
          if (p.color === "White") {
            result += letter.toLocaleUpperCase();
          } else {
            result += letter.toLocaleLowerCase();
          }
        } else {
          emptySquares++;
        }
      }
      if (emptySquares) {
        result += emptySquares;
      }
      if (y < 7) {
        result += "/";
      }
    }
    return result;
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

  equals(other: BitBoard): boolean {
    return (
      this.kingBits.equals(other.kingBits) &&
      this.queenBits.equals(other.queenBits) &&
      this.rookBits.equals(other.rookBits) &&
      this.bishopBits.equals(other.bishopBits) &&
      this.knightBits.equals(other.knightBits) &&
      this.pawnBits.equals(other.pawnBits) &&
      this.extraBits.equals(other.extraBits)
    );
  }
}

export const initialBoard = BitBoard.buildFromPieces([
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
