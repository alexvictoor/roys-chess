import { decodeFromPosition, decodeToPosition } from "./bitboard";
import { MAX_PLY } from "./move-stack";

const SIZE = 2 * 64 * 64;
const MAX_HISTORY_SCORE: i32 = 8000;

/**
 * Quiet move ordering heuristics: two killer moves per ply and a
 * (player, from, to) history table fed by beta cut-offs.
 */
export class History {
  private cutOffScores: StaticArray<i32> = new StaticArray<i32>(SIZE);

  private primaryKillers: StaticArray<u32> = new StaticArray<u32>(MAX_PLY);
  private secondaryKillers: StaticArray<u32> = new StaticArray<u32>(MAX_PLY);

  @inline
  private computeMoveIndex(player: i8, move: u32): i32 {
    return (
      ((((<i32>decodeFromPosition(move)) << 6) + <i32>decodeToPosition(move)) <<
        1) +
      player
    );
  }

  /** Kept for API compatibility: played moves no longer need tracking. */
  @inline
  recordPlayedMove(player: i8, ply: i8, move: u32): void {}

  @inline
  recordCutOffMove(player: i8, ply: i8, depth: i8, move: u32): void {
    const index = this.computeMoveIndex(player, move);
    const bonus = <i32>depth * <i32>depth;
    const updated = unchecked(this.cutOffScores[index]) + bonus;
    unchecked((this.cutOffScores[index] = updated > MAX_HISTORY_SCORE ? MAX_HISTORY_SCORE : updated));
    const currentPrimary = unchecked(this.primaryKillers[ply]);
    if (currentPrimary != move) {
      unchecked((this.primaryKillers[ply] = move));
      unchecked((this.secondaryKillers[ply] = currentPrimary));
    }
  }

  @inline
  isKiller(ply: i8, move: u32): boolean {
    return unchecked(this.primaryKillers[ply]) == move || unchecked(this.secondaryKillers[ply]) == move;
  }

  /** Ordering score of a quiet move, always below capture scores. */
  @inline
  getMoveScore(player: i8, ply: i8, move: u32): i16 {
    if (unchecked(this.primaryKillers[ply]) === move) {
      return 15000;
    }
    if (unchecked(this.secondaryKillers[ply]) === move) {
      return 14000;
    }
    return <i16>unchecked(this.cutOffScores[this.computeMoveIndex(player, move)]);
  }

  resetHistory(): void {
    for (let index = 0; index < MAX_PLY; index++) {
      unchecked((this.primaryKillers[index] = 0));
      unchecked((this.secondaryKillers[index] = 0));
    }
    for (let index = 0; index < SIZE; index++) {
      unchecked((this.cutOffScores[index] = 0));
    }
  }

  /** Between two searches of the same game: keep some knowledge but decay it. */
  ageHistory(): void {
    for (let index = 0; index < MAX_PLY; index++) {
      unchecked((this.primaryKillers[index] = 0));
      unchecked((this.secondaryKillers[index] = 0));
    }
    for (let index = 0; index < SIZE; index++) {
      unchecked((this.cutOffScores[index] = this.cutOffScores[index] >> 3));
    }
  }
}

export const history = new History();
