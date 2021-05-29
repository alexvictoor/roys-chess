import { BitBoard } from "./bitboard";

export const EXACT_SCORE: i8 = 0;
export const ALPHA_SCORE: i8 = 1;
export const BETA_SCORE: i8 = 2;

const debugMap = new Map<u64, string>();

export class TranspositionTable {
  verificationEntries: StaticArray<u64>;
  moveEntries: StaticArray<u64>;
  size: i32;

  constructor(sizeMagnitude: i32 = 24) {
    this.size = 1 << sizeMagnitude;
    this.verificationEntries = new StaticArray<u64>(this.size);
    this.moveEntries = new StaticArray<u64>(this.size);
  }

  reset(sizeMagnitude: i32 = 24): void {
    const size: i32 = 1 << sizeMagnitude;
    if (this.size == size) {
      for (let index: i32 = 0; index < size; index++) {
        unchecked((this.verificationEntries[index] = 0));
        unchecked((this.moveEntries[index] = 0));
      }
    } else {
      this.size = size;
      this.verificationEntries = new StaticArray<u64>(this.size);
      this.moveEntries = new StaticArray<u64>(this.size);
    }
  }

  record(
    board: BitBoard,
    move: u32,
    score: i16,
    scoreType: i8,
    depth: i8
  ): void {
    const hash = board.hashCode();
    /*if (debugMap.has(hash)) {
      const fenAlreadySeen = debugMap.get(hash);
      if (fenAlreadySeen != board.toFEN()) {
        trace("Same HASH " + fenAlreadySeen + " " + board.toFEN());
      }
    } else {
      debugMap.set(hash, board.toFEN());
    }*/
    const index: i32 = <i32>(hash % this.size);
    const existingEntry = this.moveEntries[index];
    if (existingEntry != 0 && decodeDepthFromEntry(existingEntry) > depth) {
      return;
    }
    /*if (existingEntry != 0 && decodeDepthFromEntry(existingEntry) >= depth) {
      trace(board.toFEN());
    }*/
    const verificationEntry: u64 = (<u64>depth) | ((hash >> 5) << 5);
    unchecked((this.verificationEntries[index] = verificationEntry));
    unchecked(
      (this.moveEntries[index] =
        (<u64>scoreType) |
        ((<u64>move) << 2) |
        (((<u64>score) & 0xffff) << 32) |
        ((<u64>depth) << 48))
    );
  }

  getEntry(board: BitBoard): u64 {
    const hash = board.hashCode();
    /*if (debugMap.has(hash)) {
      const fenAlreadySeen = debugMap.get(hash);
      trace("Same HASH " + fenAlreadySeen + " " + board.toFEN());
    }*/
    const index = <i32>(hash % this.size);
    const verificationEntry = unchecked(this.verificationEntries[index]);
    const hashVerified = verificationEntry >> 5 == hash >> 5;
    if (hashVerified) {
      return unchecked(this.moveEntries[index]);
    }
    return 0;
  }
}

export function decodeMoveFromEntry(entry: u64): u32 {
  return <u32>((entry >> 2) & 0b00111111111111111111111111111111);
}
export function decodeScoreFromEntry(entry: u64): i16 {
  return <i16>((entry >> 32) & 0xffff);
}
export function decodeScoreTypeFromEntry(entry: u64): i8 {
  return <i8>(entry & 0b00000011);
}
export function decodeDepthFromEntry(entry: u64): i8 {
  return <i8>(entry >> 48);
}

let transpositionTable: TranspositionTable = new TranspositionTable(1);

export function getTranspositionTable(): TranspositionTable {
  return transpositionTable;
}

export function setupTranspositionTable(): void {
  transpositionTable = new TranspositionTable(1);
}
