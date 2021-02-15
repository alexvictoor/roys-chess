import { Bits, indexToPosition, positionToIndex } from "./bits";
import {
  BISHOP,
  BLACK,
  Board,
  CastlingRights,
  initialCastlingRights,
  isKingSideRook,
  isQueenSideRook,
  KING,
  KNIGHT,
  MoveOutcome,
  PAWN,
  PieceOnBoard,
  Position,
  QUEEN,
  ROOK,
  WHITE,
} from "./chess";
export class BitBoard implements Board {
  /*private whiteBits = new Bits();
  private blackBits = new Bits();
  private kingBits = new Bits();
  private queenBits = new Bits();
  private rookBits = new Bits();
  private bishopBits = new Bits();
  private knightBits = new Bits();
  private pawnBits = new Bits();
  private extraBits = new Bits();
  private clock: number = 0;*/

  constructor(
    private whiteBits: Bits = new Bits(),
    private blackBits: Bits = new Bits(),
    private kingBits: Bits = new Bits(),
    private queenBits: Bits = new Bits(),
    private rookBits: Bits = new Bits(),
    private bishopBits: Bits = new Bits(),
    private knightBits: Bits = new Bits(),
    private pawnBits: Bits = new Bits(),
    private extraBits: Bits = new Bits(),
    private clock: number = 0
  ) {
    /*this.move.bind(this);
    this.getAt.bind(this);
    this.getPieceBits.bind(this);
    this.putPieceOnBoard.bind(this);*/
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

  get enPassantFile(): i8 {
    const it = this.extraBits.iterator();
    for (let index: i8 = 0; index < 8; index++) {
      if (it.next()) {
        return index;
      }
    }
    return -1;
  }

  get halfMoveClock(): i8 {
    return this.clock;
  }

  private setEnPassantFile(file: number): void {
    for (let index: i8 = 0; index < 8; index++) {
      this.extraBits.set(index, file === index);
    }
  }
  private resetEnPassantFile(): void {
    for (let index: i8 = 0; index < 8; index++) {
      this.extraBits.set(index, false);
    }
  }

  static buildFromPieces(
    pieces: PieceOnBoard[],
    halfMoveClock: number = 0,
    castlingRights: CastlingRights = initialCastlingRights,
    enPassantFile: number = -1
  ): BitBoard {
    const board = new BitBoard();
    if (!castlingRights.WhiteKingSide) {
      board.removeKingSideCastlingRight(WHITE);
    }
    if (!castlingRights.WhiteQueenSide) {
      board.removeQueenSideCastlingRight(WHITE);
    }
    if (!castlingRights.BlackKingSide) {
      board.removeKingSideCastlingRight(BLACK);
    }
    if (!castlingRights.BlackQueenSide) {
      board.removeQueenSideCastlingRight(BLACK);
    }
    for (let index = 0; index < pieces.length; index++) {
      const p = pieces[index];
      board.putPieceOnBoard(p, true);
    }
    board.setEnPassantFile(enPassantFile);
    board.clock = halfMoveClock;
    return board;
  }

  queenSideCastlingRight(player: i8): boolean {
    const bitPosition = player === WHITE ? <i8>10 : <i8>11;
    return !this.extraBits.get(bitPosition);
  }
  removeQueenSideCastlingRight(player: i8): void {
    const bitPosition = player === WHITE ? <i8>10 : <i8>11;
    this.extraBits.set(bitPosition, true);
  }
  kingSideCastlingRight(player: i8): boolean {
    const bitPosition = player === WHITE ? <i8>8 : <i8>9;
    return !this.extraBits.get(bitPosition);
  }
  removeKingSideCastlingRight(player: i8): void {
    const bitPosition = player === WHITE ? <i8>8 : <i8>9;
    this.extraBits.set(bitPosition, true);
  }

  putPieceOnBoard(p: PieceOnBoard, onBoard: boolean): void {
    const bits = this.getPieceBits(p.piece);
    bits.setAtPosition(p.position, onBoard);
    if (p.color === WHITE) {
      this.whiteBits.setAtPosition(p.position, onBoard);
    } else {
      this.blackBits.setAtPosition(p.position, onBoard);
    }
  }

  getPieceBits(type: i8): Bits {
    switch (type) {
      case KING:
        return this.kingBits;
      case QUEEN:
        return this.queenBits;
      case ROOK:
        return this.rookBits;
      case BISHOP:
        return this.bishopBits;
      case KNIGHT:
        return this.knightBits;
      case PAWN:
        return this.pawnBits;
    }
    throw new Error("UNKNOWN TYPE");
  }

  playerBits(player: i8): Bits {
    return player === WHITE ? this.whiteBits : this.blackBits;
  }

  getKing(player: i8): PieceOnBoard {
    return {
      color: player,
      piece: KING,
      position: this.playerBits(player)
        .and(this.kingBits)
        .getFirstBitPosition(),
    };
  }

  getPieces(player: i8, name: i8): PieceOnBoard[] {
    return this.playerBits(player)
      .and(this.getPieceBits(name))
      .getPositions()
      .map((position) => ({
        color: player,
        piece: name,
        position,
      }));
  }

  getPlayerPieces(player: i8): PieceOnBoard[] {
    const playerBits = this.playerBits(player);
    const kingIt = this.kingBits.and(playerBits).iterator();
    const queenIt = this.queenBits.and(playerBits).iterator();
    const rookIt = this.rookBits.and(playerBits).iterator();
    const bishopIt = this.bishopBits.and(playerBits).iterator();
    const knightIt = this.knightBits.and(playerBits).iterator();
    const pawnIt = this.pawnBits.and(playerBits).iterator();

    const pieces: PieceOnBoard[] = [];
    for (let index: i8 = 0; index < 64; index++) {
      if (kingIt.next()) {
        pieces.push({
          color: player,
          piece: KING,
          position: indexToPosition(index),
        });
      }
      if (queenIt.next()) {
        pieces.push({
          color: player,
          piece: QUEEN,
          position: indexToPosition(index),
        });
      }
      if (rookIt.next()) {
        pieces.push({
          color: player,
          piece: ROOK,
          position: indexToPosition(index),
        });
      }
      if (bishopIt.next()) {
        pieces.push({
          color: player,
          piece: BISHOP,
          position: indexToPosition(index),
        });
      }
      if (knightIt.next()) {
        pieces.push({
          color: player,
          piece: KNIGHT,
          position: indexToPosition(index),
        });
      }
      if (pawnIt.next()) {
        pieces.push({
          color: player,
          piece: PAWN,
          position: indexToPosition(index),
        });
      }
    }
    return pieces;
  }

  /*getPlayerPiecesX(player: i8): PieceOnBoard[] {
    const pieceNames: PieceName[] = [
      KING,
      QUEEN,
      ROOK,
      BISHOP,
      KNIGHT,
      PAWN,
    ];
    return pieceNames
      .map((pieceName) => this.getPieces(player, pieceName))
      .flat();
  }*/

  playerAt(pos: Position): i8 {
    if (this.whiteBits.getAtPosition(pos)) {
      return WHITE;
    }
    if (this.blackBits.getAtPosition(pos)) {
      return BLACK;
    }
    return -1;
  }

  pieceAt(pos: Position): i8 {
    const index = positionToIndex(pos);

    if (this.pawnBits.get(index)) {
      return PAWN;
    }
    if (this.rookBits.get(index)) {
      return ROOK;
    }
    if (this.bishopBits.get(index)) {
      return BISHOP;
    }
    if (this.knightBits.get(index)) {
      return KNIGHT;
    }
    if (this.kingBits.get(index)) {
      return KING;
    }
    if (this.queenBits.get(index)) {
      return QUEEN;
    }
    throw new Error("No piece found");
  }

  getAt(pos: Position): PieceOnBoard | null {
    const color = this.playerAt(pos);
    if (color === -1) {
      return null;
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
    if (to.captureEnPassant !== null) {
      boardUpdated.putPieceOnBoard(<PieceOnBoard>to.captureEnPassant, false);
    }
    boardUpdated.putPieceOnBoard(piece, false);

    const updatedPiece: PieceOnBoard = {
      piece: piece.piece,
      color: piece.color,
      position: to,
    };

    if (piece.piece === PAWN) {
      const lastRow = piece.color === WHITE ? 0 : 7;
      if (to.y === lastRow) {
        updatedPiece.piece = to.promoteTo;
      } else if (Math.abs(piece.position.y - to.y) === 2) {
        // en passant will be possible
        // next turn
        boardUpdated.setEnPassantFile(piece.position.x);
      }
    } else if (piece.piece === KING) {
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

  toString(): string {
    const PIECES: string[] = ["P", "N", "B", "R", "Q", "K"];
    let result = "\n   A B C D E F G H \n\n";
    for (let y = 0; y < 8; y++) {
      result += (8 - y).toString() + " ";
      for (let x = 0; x < 8; x++) {
        result += " ";
        const p = this.getAt({ x, y });
        if (p) {
          const letter = PIECES[p.piece];
          if (p.color === WHITE) {
            result += letter.toUpperCase();
          } else {
            result += letter.toLowerCase();
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
  { piece: ROOK, color: BLACK, position: { x: 0, y: 0 } },
  { piece: KNIGHT, color: BLACK, position: { x: 1, y: 0 } },
  { piece: BISHOP, color: BLACK, position: { x: 2, y: 0 } },
  { piece: QUEEN, color: BLACK, position: { x: 3, y: 0 } },
  { piece: KING, color: BLACK, position: { x: 4, y: 0 } },
  { piece: BISHOP, color: BLACK, position: { x: 5, y: 0 } },
  { piece: KNIGHT, color: BLACK, position: { x: 6, y: 0 } },
  { piece: ROOK, color: BLACK, position: { x: 7, y: 0 } },
  { piece: PAWN, color: BLACK, position: { x: 0, y: 1 } },
  { piece: PAWN, color: BLACK, position: { x: 1, y: 1 } },
  { piece: PAWN, color: BLACK, position: { x: 2, y: 1 } },
  { piece: PAWN, color: BLACK, position: { x: 3, y: 1 } },
  { piece: PAWN, color: BLACK, position: { x: 4, y: 1 } },
  { piece: PAWN, color: BLACK, position: { x: 5, y: 1 } },
  { piece: PAWN, color: BLACK, position: { x: 6, y: 1 } },
  { piece: PAWN, color: BLACK, position: { x: 7, y: 1 } },
  { piece: PAWN, color: WHITE, position: { x: 0, y: 6 } },
  { piece: PAWN, color: WHITE, position: { x: 1, y: 6 } },
  { piece: PAWN, color: WHITE, position: { x: 2, y: 6 } },
  { piece: PAWN, color: WHITE, position: { x: 3, y: 6 } },
  { piece: PAWN, color: WHITE, position: { x: 4, y: 6 } },
  { piece: PAWN, color: WHITE, position: { x: 5, y: 6 } },
  { piece: PAWN, color: WHITE, position: { x: 6, y: 6 } },
  { piece: PAWN, color: WHITE, position: { x: 7, y: 6 } },
  { piece: ROOK, color: WHITE, position: { x: 0, y: 7 } },
  { piece: KNIGHT, color: WHITE, position: { x: 1, y: 7 } },
  { piece: BISHOP, color: WHITE, position: { x: 2, y: 7 } },
  { piece: QUEEN, color: WHITE, position: { x: 3, y: 7 } },
  { piece: KING, color: WHITE, position: { x: 4, y: 7 } },
  { piece: BISHOP, color: WHITE, position: { x: 5, y: 7 } },
  { piece: KNIGHT, color: WHITE, position: { x: 6, y: 7 } },
  { piece: ROOK, color: WHITE, position: { x: 7, y: 7 } },
]);
