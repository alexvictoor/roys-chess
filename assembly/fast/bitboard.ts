import { zobristKeys } from "./generated-zobrist-keys";

export const noBorderMask: u64 =
  (((1 << 48) - 1) << 8) ^
  ((1 << 8) | (1 << 16) | (1 << 24) | (1 << 32) | (1 << 40) | (1 << 48)) ^
  ((1 << 15) | (1 << 23) | (1 << 31) | (1 << 39) | (1 << 47) | (1 << 55));

export const leftBorderMask: u64 = ~(
  1 |
  (1 << 8) |
  (1 << 16) |
  (1 << 24) |
  (1 << 32) |
  (1 << 40) |
  (1 << 48) |
  (1 << 56)
);

export const rightBorderMask: u64 = ~(
  (1 << 7) |
  (1 << 15) |
  (1 << 23) |
  (1 << 31) |
  (1 << 39) |
  (1 << 47) |
  (1 << 55) |
  (1 << 63)
);
export function maskString(mask: u64): string {
  let result: string = "\n";
  for (let i: i8 = 7; i >= 0; i--) {
    for (let j: i8 = 0; j < 8; j++) {
      result += mask & (1 << (i * 8 + j)) ? "1" : ".";
    }
    result += "\n";
  }
  return result;
}

export const PAWN: i8 = 0;
export const KNIGHT: i8 = 2;
export const BISHOP: i8 = 4;
export const ROOK: i8 = 6;
export const QUEEN: i8 = 8;
export const KING: i8 = 10;

export const PLAYER_PIECES: i8 = 12;

export const ALL_PIECES: i8 = 14;
export const EXTRA: i8 = 15;
export const PREVIOUS_ACTION: i8 = 16;

export const WHITE: i8 = 0;
export const BLACK: i8 = 1;

const BIT_MASK_4 = (1 << 4) - 1;
const BIT_MASK_6 = (1 << 6) - 1;

export const opponent = (player: i8): i8 => (player === WHITE ? BLACK : WHITE);
export class BitBoard {
  constructor(private bits: StaticArray<u64> = new StaticArray<u64>(17)) {}

  getPieceAt(position: i8): i8 {
    const mask: u64 = 1 << position;
    for (let i: i8 = 0; i < PLAYER_PIECES; i++) {
      if (unchecked(this.bits[i]) & mask) {
        return i;
      }
    }
    throw new Error(
      "Piece not found at position " +
        position.toString() +
        " on board " +
        this.toString()
    );
  }

  putPiece(piece: i8, player: i8, position: i8): void {
    const mask: u64 = 1 << position;
    unchecked((this.bits[piece + player] |= mask));
    unchecked((this.bits[PLAYER_PIECES + player] |= mask));
    unchecked((this.bits[ALL_PIECES] |= mask));
  }

  private put(piece: i8, position: i8): void {
    const mask: u64 = 1 << position;
    const player: i8 = piece & 1;
    unchecked((this.bits[piece] |= mask));
    unchecked((this.bits[PLAYER_PIECES + player] |= mask));
    unchecked((this.bits[ALL_PIECES] |= mask));
  }

  removePiece(piece: i8, player: i8, position: i8): void {
    const mask: u64 = ~(1 << position);
    unchecked((this.bits[piece + player] &= mask));
    unchecked((this.bits[PLAYER_PIECES + player] &= mask));
    unchecked((this.bits[ALL_PIECES] &= mask));
  }

  private remove(piece: i8, position: i8): void {
    const mask: u64 = ~(1 << position);
    const player: i8 = piece & 1;
    unchecked((this.bits[piece] &= mask));
    unchecked((this.bits[PLAYER_PIECES + player] &= mask));
    unchecked((this.bits[ALL_PIECES] &= mask));
  }

  getEnPassantFile(): i8 {
    if (unchecked(this.bits[EXTRA]) & 1) {
      return (<i8>(unchecked(this.bits[EXTRA]) >> 1)) & ((1 << 3) - 1);
    }
    return -1;
  }

  @inline
  getAllPiecesMask(): u64 {
    return unchecked(this.bits[ALL_PIECES]);
  }
  @inline
  getPlayerPiecesMask(player: i8): u64 {
    return unchecked(this.bits[PLAYER_PIECES + player]);
  }
  @inline
  getKingMask(player: i8): u64 {
    return unchecked(this.bits[KING + player]);
  }
  @inline
  getQueenMask(player: i8): u64 {
    return unchecked(this.bits[QUEEN + player]);
  }
  @inline
  getRookMask(player: i8): u64 {
    return unchecked(this.bits[ROOK + player]);
  }
  @inline
  getBishopMask(player: i8): u64 {
    return unchecked(this.bits[BISHOP + player]);
  }
  @inline
  getKnightMask(player: i8): u64 {
    return unchecked(this.bits[KNIGHT + player]);
  }
  @inline
  getPawnMask(player: i8): u64 {
    return unchecked(this.bits[PAWN + player]);
  }
  getPreviousMove(): u64 {
    return unchecked(this.bits[PREVIOUS_ACTION]);
  }

  kingSideCastlingRight(player: i8): boolean {
    return !((unchecked(this.bits[EXTRA]) >> (4 + player)) & 1);
  }
  removeKingSideCastlingRight(player: i8): void {
    unchecked((this.bits[EXTRA] |= 1 << (4 + player)));
  }
  queenSideCastlingRight(player: i8): boolean {
    return !((unchecked(this.bits[EXTRA]) >> (6 + player)) & 1);
  }
  removeQueenSideCastlingRight(player: i8): void {
    unchecked((this.bits[EXTRA] |= 1 << (6 + player)));
  }

  getHalfMoveClock(): i8 {
    return <i8>((this.bits[EXTRA] >> 8) & 0xff);
  }

  execute(action: u64): BitBoard {
    const srcPiece: i8 = <i8>(action & BIT_MASK_4);
    const fromPosition: i8 = <i8>((action >> 4) & BIT_MASK_6);
    const destPiece: i8 = <i8>((action >> 10) & BIT_MASK_4);
    const toPosition: i8 = <i8>((action >> 14) & BIT_MASK_6);

    const player = srcPiece & 1;

    const bits = StaticArray.slice(this.bits);
    unchecked((bits[PREVIOUS_ACTION] = action));
    const updatedBoard = new BitBoard(bits);
    updatedBoard.remove(srcPiece, fromPosition);

    const capturedPiece: i8 = <i8>((action >> 20) & BIT_MASK_4);
    const capturePosition: i8 = <i8>((action >> 24) & BIT_MASK_6);
    if (capturePosition || capturedPiece) {
      updatedBoard.remove(capturedPiece, capturePosition);
    }

    updatedBoard.put(destPiece, toPosition);

    if (srcPiece == KING + player) {
      updatedBoard.removeKingSideCastlingRight(player);
      updatedBoard.removeQueenSideCastlingRight(player);
    }

    const castlingRookPiece: i8 = <i8>((action >> 30) & BIT_MASK_4);
    const castlingRookPosition: i8 = <i8>((action >> 34) & BIT_MASK_6);
    const castlingRookDestination: i8 = <i8>((action >> 40) & BIT_MASK_6);
    if (castlingRookPiece) {
      updatedBoard.remove(castlingRookPiece, castlingRookPosition);
      updatedBoard.put(castlingRookPiece, castlingRookDestination);
    }

    const kingSideRookPosition = player === WHITE ? 7 : 63;
    if (!(bits[ROOK + player] & (1 << kingSideRookPosition))) {
      updatedBoard.removeKingSideCastlingRight(player);
    }
    const queenSideRookPosition = player === WHITE ? 0 : 56;
    if (!(bits[ROOK + player] & (1 << queenSideRookPosition))) {
      updatedBoard.removeQueenSideCastlingRight(player);
    }

    // en passant file
    bits[EXTRA] = (bits[EXTRA] & ~BIT_MASK_4) | ((action >> 46) & BIT_MASK_4);

    // update clock
    if (capturePosition || capturedPiece || srcPiece == PAWN + player) {
      bits[EXTRA] = bits[EXTRA] & ~(0xff << 8);
    } else {
      //log(<i8>(bits[EXTRA] >> 8));
      //log((bits[EXTRA] >> 8) & 0xff);
      const clock: i8 = <i8>((bits[EXTRA] >> 8) & 0xff) + 1;
      //log(clock);
      bits[EXTRA] = (bits[EXTRA] & ~(0xff << 8)) | ((<u64>clock) << 8);
    }

    // validate bits
    /*
    let whitePieces: u64 = 0;
    let blackPieces: u64 = 0;
    let allPieces: u64 = 0;
    let allPieces2: u64 = 0;
    for (let i: i8 = 0; i < PLAYER_PIECES; i++) {
      if (i % 2 === 0) {
        whitePieces ^= bits[i];
      } else {
        blackPieces ^= bits[i];
      }
      allPieces ^= bits[i];
      allPieces2 |= bits[i];
    }
    if (
      updatedBoard.getAllPiecesMask() != allPieces ||
      updatedBoard.getAllPiecesMask() != allPieces2 ||
      updatedBoard.getPlayerPiecesMask(WHITE) != whitePieces ||
      updatedBoard.getPlayerPiecesMask(BLACK) != blackPieces
    ) {
      log(this.toString());
      log(
        "srcPiece " +
          srcPiece.toString() +
          " fromPosition " +
          fromPosition.toString() +
          " toPosition " +
          toPosition.toString()
      );
      log(
        "capturedPiece " +
          capturedPiece.toString() +
          " capturePosition " +
          capturePosition.toString()
      );
      log(maskString(action));
      log(maskString(this.bits[PREVIOUS_ACTION]));
      log(maskString(this.bits[EXTRA]));

      throw "pas bobn pas bon";
    }*/
    return updatedBoard;
  }

  checkBitsValidity(): void {
    let whitePieces: u64 = 0;
    let blackPieces: u64 = 0;
    let allPieces: u64 = 0;
    let allPieces2: u64 = 0;
    for (let i: i8 = 0; i < PLAYER_PIECES; i++) {
      if (i % 2 === 0) {
        whitePieces ^= this.bits[i];
      } else {
        blackPieces ^= this.bits[i];
      }
      allPieces ^= this.bits[i];
      allPieces2 |= this.bits[i];
    }
    if (
      this.getAllPiecesMask() != allPieces ||
      this.getAllPiecesMask() != allPieces2 ||
      this.getPlayerPiecesMask(WHITE) != whitePieces ||
      this.getPlayerPiecesMask(BLACK) != blackPieces
    ) {
      throw "board not valid";
    }
  }

  toFEN(): string {
    const pieceLetters = [
      "P",
      "p",
      "N",
      "n",
      "B",
      "b",
      "R",
      "r",
      "Q",
      "q",
      "K",
      "k",
    ];
    let result: string = "";
    for (let y: i8 = 7; y > -1; y--) {
      let emptySquares: i8 = 0;
      for (let x: i8 = 0; x < 8; x++) {
        const position = y * 8 + x;
        const pieceAtPosition =
          (<u64>(1 << position)) & this.getAllPiecesMask();
        if (pieceAtPosition) {
          if (emptySquares) {
            result += emptySquares.toString();
            emptySquares = 0;
          }
          const piece = this.getPieceAt(position);
          result += pieceLetters[piece];
        } else {
          emptySquares++;
        }
      }
      if (emptySquares) {
        result += emptySquares.toString();
      }
      if (y > 0) {
        result += "/";
      }
    }
    return result;
  }

  hashCode(): u64 {
    let result: u64 = 0;
    for (let position: i8 = 0; position < 64; position++) {
      const pieceAtPosition = (<u64>(1 << position)) & this.getAllPiecesMask();
      if (pieceAtPosition) {
        const piece = this.getPieceAt(position);
        result ^= zobristKeys[<u32>piece * 64 + <u32>position];
      }
    }
    return result;
  }

  toString(): string {
    const pieceLetters = [
      "P",
      "p",
      "N",
      "n",
      "B",
      "b",
      "R",
      "r",
      "Q",
      "q",
      "K",
      "k",
    ];

    let result = "\n";
    for (let y: i8 = 7; y > -1; y--) {
      result += (y + 1).toString() + " ";
      for (let x: i8 = 0; x < 8; x++) {
        result += " ";
        const position = y * 8 + x;
        const pieceAtPosition =
          (<u64>(1 << position)) & this.getAllPiecesMask();
        if (pieceAtPosition) {
          const piece = this.getPieceAt(position);
          result += pieceLetters[piece];
        } else {
          result += ".";
        }
      }
      result += "\n\n";
    }
    result += "   A B C D E F G H ";
    return result;
  }
}
export class MaskIterator {
  public currentMask: u64;
  public currentPosition: i8;
  @inline
  public reset(mask: u64): void {
    this.currentMask = mask;
    this.currentPosition = 0;
  }
  @inline
  public hasNext(): boolean {
    return !!this.currentMask;
  }
  @inline
  public next(): i8 {
    const increment = ctz(this.currentMask);
    this.currentPosition += <i8>increment;
    const result = this.currentPosition;
    this.currentMask = (this.currentMask >> (<u64>increment)) >> 1;
    this.currentPosition++;
    return result;
  }
}

export function encodeMove(
  srcPiece: i8,
  fromPosition: i8,
  dstPiece: i8,
  toPosition: i8
): u64 {
  return (
    (<u64>(srcPiece & BIT_MASK_4)) |
    ((<u64>(fromPosition & BIT_MASK_6)) << 4) |
    ((<u64>(dstPiece & BIT_MASK_4)) << 10) |
    ((<u64>(toPosition & BIT_MASK_6)) << 14)
  );
}

export function encodePawnDoubleMove(
  player: i8,
  fromPosition: i8,
  toPosition: i8
): u64 {
  let move = encodeMove(PAWN + player, fromPosition, PAWN + player, toPosition);
  move |= ((<u64>toPosition % 8 << 1) + 1) << 46;
  return move;
}

export function encodeCapture(
  srcPiece: i8,
  fromPosition: i8,
  dstPiece: i8,
  toPosition: i8,
  capturedPiece: i8,
  capturedPosition: i8 = toPosition
): u64 {
  return (
    encodeMove(srcPiece, fromPosition, dstPiece, toPosition) |
    ((<u64>(capturedPiece & BIT_MASK_4)) << 20) |
    ((<u64>(capturedPosition & BIT_MASK_6)) << 24)
  );
}

export function encodeCastling(
  kingPiece: i8,
  kingPosition: i8,
  kingDestination: i8,
  rookPiece: i8,
  rookPosition: i8,
  rookDestination: i8
): u64 {
  return (
    encodeCapture(kingPiece, kingPosition, kingPiece, kingDestination, 0, 0) |
    ((<u64>(rookPiece & BIT_MASK_4)) << 30) |
    ((<u64>(rookPosition & BIT_MASK_6)) << 34) |
    ((<u64>(rookDestination & BIT_MASK_6)) << 40)
  );
}

const cols = ["a", "b", "c", "d", "e", "f", "g", "h"];
function getCodeFromPosition(position: i8): string {
  const y = (position >> 3) + 1;
  const x = position & ((1 << 3) - 1);
  return cols[x] + y.toString();
}

export function toNotation(action: u64): string {
  const fromPosition: i8 = <i8>((action >> 4) & BIT_MASK_6);
  const toPosition: i8 = <i8>((action >> 14) & BIT_MASK_6);
  const castlingRookDestination: i8 = <i8>((action >> 40) & BIT_MASK_6);
  if (castlingRookDestination) {
    return castlingRookDestination > fromPosition ? "O-O" : "O-O-O";
  }
  return (
    getCodeFromPosition(fromPosition) + "-" + getCodeFromPosition(toPosition)
  );
}
