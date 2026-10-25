import { BitBoard } from "./bitboard";

export const EXACT_SCORE: i8 = 0;
export const ALPHA_SCORE: i8 = 1; // upper bound (fail low)
export const BETA_SCORE: i8 = 2; // lower bound (fail high)

export const DEFAULT_TT_SIZE_MAGNITUDE: i32 = 22; // 4M entries, 64MB

/**
 * Transposition table. Two parallel arrays: the full 64 bit hash for
 * verification, and a packed entry:
 *   bits 0-1   score type
 *   bits 2-31  move
 *   bits 32-47 score (i16)
 *   bits 48-55 depth
 *   bits 56-63 generation (search number, for replacement)
 */
export class TranspositionTable {
  verificationEntries: StaticArray<u64>;
  moveEntries: StaticArray<u64>;
  size: i32;
  generation: u8 = 0;

  constructor(sizeMagnitude: i32 = DEFAULT_TT_SIZE_MAGNITUDE) {
    this.size = 1 << sizeMagnitude;
    this.verificationEntries = new StaticArray<u64>(this.size);
    this.moveEntries = new StaticArray<u64>(this.size);
  }

  reset(sizeMagnitude: i32 = DEFAULT_TT_SIZE_MAGNITUDE): void {
    const size: i32 = 1 << sizeMagnitude;
    this.generation = 0;
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

  /** Call once per new search: older entries become replaceable. */
  newSearch(): void {
    this.generation++;
  }

  record(
    board: BitBoard,
    move: u32,
    score: i16,
    scoreType: i8,
    depth: i8
  ): void {
    const hash = board.hashCode();
    const index: i32 = <i32>(hash & (this.size - 1));
    const existingEntry = unchecked(this.moveEntries[index]);
    if (existingEntry != 0) {
      const sameHash = unchecked(this.verificationEntries[index]) == hash;
      const sameGeneration = decodeGenerationFromEntry(existingEntry) == this.generation;
      if (
        !sameHash &&
        sameGeneration &&
        decodeDepthFromEntry(existingEntry) > depth
      ) {
        // keep the deeper entry of the current search
        return;
      }
      if (sameHash && decodeDepthFromEntry(existingEntry) > depth && scoreType != EXACT_SCORE) {
        return;
      }
    }
    unchecked((this.verificationEntries[index] = hash));
    unchecked(
      (this.moveEntries[index] =
        (<u64>scoreType) |
        ((<u64>move) << 2) |
        (((<u64>score) & 0xffff) << 32) |
        ((<u64>(<u8>depth)) << 48) |
        ((<u64>this.generation) << 56))
    );
  }

  getEntry(board: BitBoard): u64 {
    const hash = board.hashCode();
    const index = <i32>(hash & (this.size - 1));
    if (unchecked(this.verificationEntries[index]) == hash) {
      return unchecked(this.moveEntries[index]);
    }
    return 0;
  }
}

@inline
export function decodeMoveFromEntry(entry: u64): u32 {
  return <u32>((entry >> 2) & 0x3fffffff);
}
@inline
export function decodeScoreFromEntry(entry: u64): i16 {
  return <i16>((entry >> 32) & 0xffff);
}
@inline
export function decodeScoreTypeFromEntry(entry: u64): i8 {
  return <i8>(entry & 0b00000011);
}
@inline
export function decodeDepthFromEntry(entry: u64): i8 {
  return <i8>((entry >> 48) & 0xff);
}
@inline
export function decodeGenerationFromEntry(entry: u64): u8 {
  return <u8>(entry >> 56);
}

let transpositionTable: TranspositionTable = new TranspositionTable(1);

export function getTranspositionTable(): TranspositionTable {
  return transpositionTable;
}

export function setupTranspositionTable(): void {
  transpositionTable = new TranspositionTable(1);
}
