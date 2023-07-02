import { zobristKeys } from "./generated-zobrist-keys";

export const noBorderMask: u64 =
  (((1 << 48) - 1) << 8) ^
  ((1 << 8) | (1 << 16) | (1 << 24) | (1 << 32) | (1 << 40) | (1 << 48)) ^
  ((1 << 15) | (1 << 23) | (1 << 31) | (1 << 39) | (1 << 47) | (1 << 55));

export const firstColMask: u64 = (
  1 |
  (1 << 8) |
  (1 << 16) |
  (1 << 24) |
  (1 << 32) |
  (1 << 40) |
  (1 << 48) |
  (1 << 56)
);
export const firstRowMask: u64 = (
  1 |
  2 |
  (1 << 2) |
  (1 << 3) |
  (1 << 4) |
  (1 << 5) |
  (1 << 6) |
  (1 << 7)
);

export const lastColMask = firstColMask << 7;

export const leftBorderMask: u64 = ~firstColMask;

export const rightBorderMask: u64 = ~lastColMask;

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

export const ACTION_OFFSET_EN_PASSANT: i8 = 26;

export const HASH: i8 = 16;
export const PREVIOUS_ACTION: i8 = 17;
export const CLOCK: i8 = 18;

export const WHITE: i8 = 0;
export const BLACK: i8 = 1;

export const BIT_MASK_4 = (1 << 4) - 1;
const BIT_MASK_6 = (1 << 6) - 1;
const BIT_MASK_50: u64 = ((<u64>1) << 50) - 1;

const ZOBRIST_PLAYER_KEY = 1634556789;


export const opponent = (player: i8): i8 => (player == WHITE ? BLACK : WHITE);
export class BitBoard {

  private stateHistory: u64[] = [];
  public hashHistory: u64[] = [];

  public currentPlayer: i8 = WHITE;

  constructor(public bits: StaticArray<u64> = new StaticArray<u64>(19)) {}

  getPieceAt(position: i8): i8 {
    const mask: u64 = 1 << position;
    for (let i: i8 = 0; i < PLAYER_PIECES; i++) {
      if (unchecked(this.bits[i]) & mask) {
        return i;
      }
    }
    throw new Error(
      "Piece not found at position " +
        position.toString() 
        //" on board " +
        //this.toString()
    );
  }

  putPiece(piece: i8, player: i8, position: i8): void {
    const mask: u64 = 1 << position;
    unchecked((this.bits[piece + player] |= mask));
    unchecked((this.bits[PLAYER_PIECES + player] |= mask));
    unchecked((this.bits[ALL_PIECES] |= mask));

    unchecked(
      (this.bits[HASH] ^= zobristKeys[((<u32>piece) << 6) + <u32>position])
    );
  }

  private put(piece: i8, position: i8): void {
    const mask: u64 = 1 << position;
    const player: i8 = piece & 1;
    unchecked((this.bits[piece] |= mask));
    unchecked((this.bits[PLAYER_PIECES + player] |= mask));
    unchecked((this.bits[ALL_PIECES] |= mask));

    unchecked(
      (this.bits[HASH] ^= zobristKeys[((<u32>piece) << 6) + <u32>position])
    );
  }

  /*removePiece(piece: i8, player: i8, position: i8): void {
    const mask: u64 = ~(1 << position);
    unchecked((this.bits[piece + player] &= mask));
    unchecked((this.bits[PLAYER_PIECES + player] &= mask));
    unchecked((this.bits[ALL_PIECES] &= mask));
  }*/

  private remove(piece: i8, position: i8): void {
    const mask: u64 = ~(1 << position);
    const player: i8 = piece & 1;
    unchecked((this.bits[piece] &= mask));
    unchecked((this.bits[PLAYER_PIECES + player] &= mask));
    unchecked((this.bits[ALL_PIECES] &= mask));

    unchecked(
      (this.bits[HASH] ^= (zobristKeys[((<u32>piece) << 6) + <u32>position]))
    );
  }

  private getEnPassantData(): i8 {
    return <i8>unchecked(this.bits[EXTRA] & BIT_MASK_4);
  }

  getEnPassantFile(): i8 {
    const data = this.getEnPassantData();
    if (data & 1) {
      return data >> 1;
    }
    return -1;
  }

  setEnPassant(flagAndFile: i8): void {
    unchecked(this.bits[HASH] ^= zobristKeys[768 + <i32>this.getEnPassantData()]); 
    
    unchecked(this.bits[EXTRA] =
      (this.bits[EXTRA] & ~BIT_MASK_4) | flagAndFile);

    unchecked(this.bits[HASH] ^=  zobristKeys[768 + <i32>this.getEnPassantData()]);  
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

  updateHashWithCastlingRights(): void {
    unchecked(this.bits[HASH] ^= zobristKeys[784 + <i32>((this.bits[EXTRA] >> 4) & BIT_MASK_4)]); 
  }

  kingSideCastlingRight(player: i8): boolean {
    return !((unchecked(this.bits[EXTRA]) >> (4 + player)) & 1);
  }
  removeKingSideCastlingRight(player: i8): void {
    this.updateHashWithCastlingRights();
    unchecked((this.bits[EXTRA] |= 1 << (4 + player)));
    this.updateHashWithCastlingRights();
    
  }
  queenSideCastlingRight(player: i8): boolean {
    return !((unchecked(this.bits[EXTRA]) >> (6 + player)) & 1);
  }
  removeQueenSideCastlingRight(player: i8): void {
    this.updateHashWithCastlingRights();
    unchecked((this.bits[EXTRA] |= 1 << (6 + player)));
    this.updateHashWithCastlingRights();
  }

  getHalfMoveClock(): i8 {
    return <i8>this.bits[CLOCK];
  }

  execute(action: u32): BitBoard {
    const bits = StaticArray.slice(this.bits);
    unchecked((bits[PREVIOUS_ACTION] = action));
    const updatedBoard = new BitBoard(bits);
    updatedBoard.do(action);
    return updatedBoard;
  }

  switchPlayer(): void {
    this.currentPlayer = opponent(this.currentPlayer);
    unchecked(
      this.bits[HASH] ^= ZOBRIST_PLAYER_KEY
    );
  }

  do(action: u32): void {
    unchecked(this.hashHistory.push(this.hashCode()));
    this.switchPlayer();
    this.storeState(action);
    const srcPiece: i8 = decodeSrcPiece(action);
    const fromPosition: i8 = decodeFromPosition(action);
    const destPiece: i8 = decodeDestPiece(action);
    const toPosition: i8 = decodeToPosition(action);

    const player = srcPiece & 1;

    //const bits = StaticArray.slice(this.bits);
    //unchecked((bits[PREVIOUS_ACTION] = action));
    //const updatedBoard = new BitBoard(bits);
    this.remove(srcPiece, fromPosition);

    const captureFlag: i8 = decodeCaptureFlag(action);
    if (captureFlag) {
      const capturedPiece: i8 = decodeCapturedPiece(action);
      const enPassantFlag: i8 = decodeCaptureEnPassantFlag(action);
      if (enPassantFlag) {
        const offset: i8 = player == WHITE ? -8 : 8;
        this.remove(capturedPiece, toPosition + offset);
      } else {
        this.remove(capturedPiece, toPosition);
      }
    }

    this.put(destPiece, toPosition);

    const kingSideRookPosition: i8 = player * 56 + 7;
    const queenSideRookPosition: i8 = player * 56;

    if (srcPiece == KING + player) {
      this.removeKingSideCastlingRight(player);
      this.removeQueenSideCastlingRight(player);

      const castling = Math.abs(toPosition - fromPosition) === 2;
      if (castling) {
        const kingSide = toPosition > fromPosition;
        if (kingSide) {
          const castlingRookDestination: i8 = player * 56 + 5;
          this.remove(ROOK + player, kingSideRookPosition);
          this.put(ROOK + player, castlingRookDestination);
        } else {
          const castlingRookDestination: i8 = player * 56 + 3;
          this.remove(ROOK + player, queenSideRookPosition);
          this.put(ROOK + player, castlingRookDestination);
        }
      }
    }

    if (!(this.bits[ROOK + player] & (1 << kingSideRookPosition))) {
      this.removeKingSideCastlingRight(player);
    }
    if (!(this.bits[ROOK + player] & (1 << queenSideRookPosition))) {
      this.removeQueenSideCastlingRight(player);
    }

    // en passant file
    this.setEnPassant(<i8>decodeMoveEnPassantFlagAndFile(action))
    /*unchecked(this.bits[EXTRA] =
      (this.bits[EXTRA] & ~BIT_MASK_4) | decodeMoveEnPassantFlagAndFile(action));*/

    // update clock
    if (captureFlag || srcPiece == PAWN + player) {
      unchecked(this.bits[CLOCK] = 0);
    } else {
      unchecked(this.bits[CLOCK]++);
    }

  }

  doNullMove(): void {
    unchecked(this.hashHistory.push(this.hashCode()));
    this.storeState(0);

    this.switchPlayer();

    // en passant file
    unchecked(this.bits[EXTRA] =
      (this.bits[EXTRA] & ~BIT_MASK_4));

    // update clock    
    this.bits[CLOCK]++;
  }

  storeState(action: u32): void {
    unchecked(this.stateHistory.push(
      <u64>action |
        (<u64>this.getEnPassantData() << 32) |
        (((this.bits[EXTRA] >> 4) & BIT_MASK_4) << 50) |
        (this.bits[CLOCK] << 54)
    ));
  }

  undo(): void {
    this.switchPlayer();
    const hash = this.hashHistory.pop();
    const state = this.stateHistory.pop();
    const castlingRights = decodeCastlingRights(state);
    
    unchecked(this.bits[EXTRA] &= castlingRights << 4);
    unchecked(this.bits[CLOCK] = state >> 54);

    const action = decodeAction(state);

    const srcPiece: i8 = decodeSrcPiece(action);
    const fromPosition: i8 = decodeFromPosition(action);
    const destPiece: i8 = decodeDestPiece(action);
    const toPosition: i8 = decodeToPosition(action);
    const player = srcPiece & 1;

    this.remove(destPiece, toPosition);
    this.put(srcPiece, fromPosition);

    const enPassantData = decodeEnPassant(state);
    this.setEnPassant(enPassantData);

    const captureFlag: i8 = decodeCaptureFlag(action);
    if (captureFlag) {
      const capturedPiece: i8 = decodeCapturedPiece(action);
      const enPassantFlag: i8 = decodeCaptureEnPassantFlag(action);
      if (enPassantFlag) {
        const offset: i8 = player === WHITE ? -8 : 8;
        this.put(capturedPiece, toPosition + offset);
      } else {
        this.put(capturedPiece, toPosition);
      }
    }

    if (srcPiece == KING + player) {
      const kingSideRookPosition: i8 = player * 56 + 7;
      const queenSideRookPosition: i8 = player * 56;

      const castling = Math.abs(toPosition - fromPosition) === 2;
      if (castling) {
        const kingSide = toPosition > fromPosition;
        if (kingSide) {
          const castlingRookDestination: i8 = player * 56 + 5;
          this.remove(ROOK + player, castlingRookDestination);
          this.put(ROOK + player, kingSideRookPosition);
        } else {
          const castlingRookDestination: i8 = player * 56 + 3;
          this.remove(ROOK + player, castlingRookDestination);
          this.put(ROOK + player, queenSideRookPosition);
        }
      }
    }

    this.bits[HASH] = hash;
   
  }

  undoNullMove(): void {
    this.switchPlayer();
    const hash = this.hashHistory.pop();
    const state = this.stateHistory.pop();
    const castlingRights = decodeCastlingRights(state);
    unchecked(this.bits[EXTRA] &= castlingRights << 4);
    unchecked(this.bits[CLOCK] = state >> 54);

    // en passant file
    const enPassantData = decodeEnPassant(state);
    this.setEnPassant(enPassantData);
    
    this.bits[HASH] = hash;
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

    if (this.currentPlayer == WHITE) {
      result += ' w ';
    } else {
      result += ' b ';
    }

    let atLeastOneCastingRight: boolean = false;

    if (this.kingSideCastlingRight(WHITE)) {
      result += 'K';
      atLeastOneCastingRight = true;
    }
    if (this.queenSideCastlingRight(WHITE)) {
      result += 'Q';
      atLeastOneCastingRight = true;
    }
    if (this.kingSideCastlingRight(BLACK)) {
      result += 'k';
      atLeastOneCastingRight = true;
    }
    if (this.queenSideCastlingRight(BLACK)) {
      result += 'q';
      atLeastOneCastingRight = true;
    }

    if (!atLeastOneCastingRight) {
      result += '-';
    } 

    result += ' ';

    if (this.getEnPassantFile() > -1) {
      if (this.currentPlayer == WHITE) {
        result +=  cols[this.getEnPassantFile()] + '6';
      } else {
        result +=  cols[this.getEnPassantFile()] + '3';
      }
    } else {
      result += '-';
    }

    result += ' ';
    result += this.getHalfMoveClock().toString();
    result += ' ';
    result += this.hashHistory.length.toString()
    return result;
  }

  private computehashCode(): u64 {
    let result: u64 = 0;
    for (let position: i8 = 0; position < 64; position++) {
      const pieceAtPosition = (<u64>(1 << position)) & this.getAllPiecesMask();
      if (pieceAtPosition) {
        const piece = this.getPieceAt(position);
        result ^= zobristKeys[((<u32>piece) << 6) + <u32>position];
      }
    }

    if (this.currentPlayer == BLACK) {
      result ^= ZOBRIST_PLAYER_KEY;
    }
    return result;
  }

  hashCode(): u64 {
    let hash = this.bits[HASH];
    if (!hash) {
      hash = this.computehashCode();
      this.bits[HASH] = hash;
    }
    return hash;
  }

  equals(board: BitBoard): boolean {
    for (let index: i8 = 16; index > 0; index--) {
      if (this.bits[index] !== board.bits[index]) {
        return false;
      }
    }
    return true;
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

// @ts-ignore
@inline
export function encodeMove(
  srcPiece: i8,
  fromPosition: i8,
  dstPiece: i8,
  toPosition: i8
): u32 {
  return (
    (<u32>(srcPiece & BIT_MASK_4)) |
    ((<u32>(fromPosition & BIT_MASK_6)) << 4) |
    ((<u32>(dstPiece & BIT_MASK_4)) << 10) |
    ((<u32>(toPosition & BIT_MASK_6)) << 14)
  );
}

// @ts-ignore
@inline
export function encodePawnDoubleMove(
  player: i8,
  fromPosition: i8,
  toPosition: i8
): u32 {
  let move = encodeMove(PAWN + player, fromPosition, PAWN + player, toPosition);
  move |= ((<u32>toPosition % 8 << 1) + 1) << ACTION_OFFSET_EN_PASSANT;
  return move;
}

// @ts-ignore
@inline
export function encodeCapture(
  srcPiece: i8,
  fromPosition: i8,
  dstPiece: i8,
  toPosition: i8,
  capturedPiece: i8,
  capturedPosition: i8 = toPosition
): u32 {
  return (
    encodeMove(srcPiece, fromPosition, dstPiece, toPosition) |
    ((<u32>(capturedPiece & BIT_MASK_4)) << 20) |
    (<u32>1 << 24) |
    ((<u32>(toPosition == capturedPosition ? 0 : 1)) << 25) // TODO clean up
    //((<u64>(capturedPosition & BIT_MASK_6)) << 24)
  );
}

// @ts-ignore
@inline
export function decodeSrcPiece(action: u32): i8 {
  return <i8>(action & BIT_MASK_4);
}
// @ts-ignore
@inline
export function decodePlayer(action: u32): i8 {
  return <i8>(decodeSrcPiece(action & 1));
}
// @ts-ignore
@inline
export function decodeFromPosition(action: u32): i8 {
  return <i8>((action >> 4) & BIT_MASK_6);
}
// @ts-ignore
@inline
export function decodeDestPiece(action: u32): i8 {
  return <i8>((action >> 10) & BIT_MASK_4);
}
// @ts-ignore
@inline
export function decodeToPosition(action: u32): i8 {
  return <i8>((action >> 14) & BIT_MASK_6);
}
// @ts-ignore
@inline
export function decodeCapturedPiece(action: u32): i8 {
  return <i8>((action >> 20) & BIT_MASK_4);
}
// @ts-ignore
@inline
export function decodeCaptureFlag(action: u32): i8 {
  return <i8>((action >> 24) & 1);
}
// @ts-ignore
@inline
export function decodeCaptureEnPassantFlag(action: u32): i8 {
  return <i8>((action >> 25) & 1);
}

// @ts-ignore
@inline
export function decodeMoveEnPassantFlagAndFile(action: u32): u64 {
  return (action >> ACTION_OFFSET_EN_PASSANT) & BIT_MASK_4;
}

// @ts-ignore
@inline
export function decodeAction(state: u64): u32 {
  return <u32>(state & 0xFFFFFFFF);
}

// @ts-ignore
@inline
export function decodeCastlingRights(state: u64): u64 {
  return (state >> 50) & BIT_MASK_4;
}
// @ts-ignore
@inline
export function decodeEnPassant(state: u64): i8 {
  return <i8>((state >> 32) & BIT_MASK_4);
}

// @ts-ignore
@inline
export function toMask(x: i8, y: i8): u64 {
  return (<u64>1) << (x + (y << 3));
}

const cols = ["a", "b", "c", "d", "e", "f", "g", "h"];
function getCodeFromPosition(position: i8): string {
  const y = (position >> 3) + 1;
  const x = position & ((1 << 3) - 1);
  return cols[x] + y.toString();
}

export function toNotation(action: u32): string {
  const fromPosition: i8 = decodeFromPosition(action);
  const toPosition: i8 = decodeToPosition(action);
  const srcPiece = decodeSrcPiece(action);
  const player = srcPiece & 1;
  const castling =
    srcPiece === KING + player && Math.abs(toPosition - fromPosition) === 2;
  if (castling) {
    return toPosition > fromPosition ? "O-O" : "O-O-O";
  }
  return (
    getCodeFromPosition(fromPosition) + "-" + getCodeFromPosition(toPosition)
  );
}

function parsePosition(notation: string): i8 {
  return <i8>cols.indexOf(notation.substring(0, 1)) + <i8>(parseInt(notation.substring(1), 10) - 1)  * <i8>8
}

export function fromUciNotation(code: string, board: BitBoard): u32 {
  const fromPosition = parsePosition(code.substring(0, 2));
  const toPosition = parsePosition(code.substring(2));
  const fromPiece = board.getPieceAt(fromPosition);
  const player = fromPiece & 1;

  if (board.getAllPiecesMask() & (1 << toPosition)) {
    const toPiece = board.getPieceAt(toPosition);
    return encodeCapture(fromPiece, fromPosition, fromPiece, toPosition, toPiece);
  }
  if ((fromPiece - player) == PAWN) {
    // TODO autre cas en passant
    // TODO double move
    // TODO promotion ?
    if ((toPosition - fromPosition) == 9) {
      return encodeCapture(fromPiece, fromPosition, fromPiece, toPosition, board.getPieceAt(fromPosition + 1), fromPosition + 1);
    }
    if ((toPosition - fromPosition) == 7) {
      return encodeCapture(fromPiece, fromPosition, fromPiece, toPosition, board.getPieceAt(fromPosition - 1), fromPosition - 1);
    }
    if ((toPosition - fromPosition) == -9) {
      return encodeCapture(fromPiece, fromPosition, fromPiece, toPosition, board.getPieceAt(fromPosition - 1), fromPosition - 1);
    }
    if ((toPosition - fromPosition) == -7) {
      return encodeCapture(fromPiece, fromPosition, fromPiece, toPosition, board.getPieceAt(fromPosition + 1), fromPosition + 1);
    }

    if ((toPosition - fromPosition) == 16 || (toPosition - fromPosition) == -16) {
      return encodePawnDoubleMove(fromPiece, fromPosition, toPosition);
    }
  }
  return encodeMove(fromPiece, fromPosition, fromPiece, toPosition);
}