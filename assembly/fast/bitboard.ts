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

export const WHITE: i8 = 0;
export const BLACK: i8 = 1;

export const opponent = (player: i8): i8 => (player === WHITE ? BLACK : WHITE);

export class BitBoard {
  constructor(private bits: StaticArray<u64> = new StaticArray<u64>(16)) {}

  getPieceAt(position: i8): i8 {
    const mask: u64 = 1 << position;
    for (let i: i8 = 0; i < 9; i++) {
      if (this.bits[i] & mask) {
        return i;
      }
    }
    throw new Error("Piece not found on board");
  }

  putPiece(piece: i8, player: i8, position: i8): void {
    const mask: u64 = 1 << position;
    this.bits[piece + player] |= mask;
    this.bits[PLAYER_PIECES + player] |= mask;
    this.bits[ALL_PIECES] |= mask;
  }

  private put(piece: i8, position: i8): void {
    const mask: u64 = 1 << position;
    const player: i8 = piece & 1;
    this.bits[piece] |= mask;
    this.bits[PLAYER_PIECES + player] |= mask;
    this.bits[ALL_PIECES] |= mask;
  }

  removePiece(piece: i8, player: i8, position: i8): void {
    const mask: u64 = ~(1 << position);
    this.bits[piece + player] &= mask;
    this.bits[PLAYER_PIECES + player] &= mask;
    this.bits[ALL_PIECES] &= mask;
  }

  private remove(piece: i8, position: i8): void {
    const mask: u64 = ~(1 << position);
    const player: i8 = piece & 1;
    this.bits[piece] &= mask;
    this.bits[PLAYER_PIECES + player] &= mask;
    this.bits[ALL_PIECES] &= mask;
  }

  getAllPiecesMask(): u64 {
    return this.bits[ALL_PIECES];
  }
  getPlayerPiecesMask(player: i8): u64 {
    return this.bits[PLAYER_PIECES + player];
  }
  getKingMask(player: i8): u64 {
    return this.bits[KING + player];
  }
  getQueenMask(player: i8): u64 {
    return this.bits[QUEEN + player];
  }
  getRookMask(player: i8): u64 {
    return this.bits[ROOK + player];
  }
  getBishopMask(player: i8): u64 {
    return this.bits[BISHOP + player];
  }
  getKnightMask(player: i8): u64 {
    return this.bits[KNIGHT + player];
  }
  getPawnMask(player: i8): u64 {
    return this.bits[PAWN + player];
  }

  execute(action: u64): BitBoard {
    const srcPiece: i8 = <i8>(action & ((1 << 4) - 1));
    const fromPosition: i8 = <i8>((action >> 4) & ((1 << 6) - 1));
    const destPiece: i8 = <i8>((action >> 10) & ((1 << 4) - 1));
    const toPosition: i8 = <i8>((action >> 14) & ((1 << 6) - 1));

    const bits = StaticArray.slice(this.bits);
    const updatedBoard = new BitBoard(bits);
    updatedBoard.remove(srcPiece, fromPosition);
    updatedBoard.put(destPiece, toPosition);

    const capturedPiece: i8 = <i8>((action >> 20) & ((1 << 4) - 1));
    const capturePosition: i8 = <i8>((action >> 24) & ((1 << 6) - 1));
    if (capturePosition || capturedPiece) {
      updatedBoard.remove(capturedPiece, capturePosition);
    }

    return updatedBoard;
  }
}

export function getPositionsFromMask(mask: u64): i8[] {
  const result: i8[] = [];
  let currentMask: u64 = mask;
  let currentPosition: i8 = 0;
  while (currentMask) {
    currentPosition += <i8>ctz(currentMask);
    result.push(currentPosition);
    currentMask = currentMask >> (<u64>(ctz(currentMask) + 1));
    currentPosition++;
  }
  return result;
}

export function encodeMove(
  srcPiece: i8,
  fromPosition: i8,
  toPosition: i8
): u64 {
  return (
    (<u64>srcPiece) |
    (fromPosition << 4) |
    ((<u64>srcPiece) << 10) |
    (toPosition << 14)
  );
}

export function encodeCapture(
  srcPiece: i8,
  fromPosition: i8,
  toPosition: i8,
  capturedPiece: i8
): u64 {
  return (
    (<u64>srcPiece) |
    (fromPosition << 4) |
    ((<u64>srcPiece) << 10) |
    (toPosition << 14) |
    ((<u64>capturedPiece) << 20) |
    (toPosition << 24)
  );
}

export function encodePromotion(
  srcPiece: i8,
  fromPosition: i8,
  toPosition: i8
): u64 {
  return 0;
}
// 1000000 6

// 10000 4
