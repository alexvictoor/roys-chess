import { decodeFromPosition, decodeToPosition } from "./bitboard";
const SIZE = 2 * 64 * 64;
export class History {
  private playedMoveCounters: StaticArray<i32> = new StaticArray<i32>(SIZE);
  private cutOffMoveCounters: StaticArray<i32> = new StaticArray<i32>(SIZE);

  private primaryKillers: StaticArray<u64> = new StaticArray<u64>(12);
  private secondaryKillers: StaticArray<u64> = new StaticArray<u64>(12);

  @inline
  private computeMoveIndex(player: i8, move: u64): i32 {
    return (
      ((((<i32>decodeFromPosition(move)) << 6) + <i32>decodeToPosition(move)) <<
        1) +
      player
    );
  }
  @inline
  recordPlayedMove(player: i8, ply: i8, move: u64): void {
    unchecked(
      (this.playedMoveCounters[this.computeMoveIndex(player, move)] += 1)
    );
  }
  @inline
  recordCutOffMove(player: i8, ply: i8, move: u64): void {
    //log(this.computeMoveIndex(player, move));
    //log(1 << ply);
    unchecked(
      (this.cutOffMoveCounters[this.computeMoveIndex(player, move)] += 1 << ply)
    );
    const currentPrimary = unchecked(this.primaryKillers[ply]);
    if (currentPrimary != move) {
      unchecked((this.primaryKillers[ply] = move));
      unchecked((this.secondaryKillers[ply] = currentPrimary));
    }
  }

  @inline
  getMoveScore(player: i8, ply: i8, move: u64): i32 {
    //log(this.cutOffMoveCounters[this.computeMoveIndex(player, move)]);

    const index = this.computeMoveIndex(player, move);
    const cutOff = unchecked(this.cutOffMoveCounters[index]);
    /*if (cutOff === 0) {
      return 0;
    }*/
    let result: i32 = cutOff - unchecked(this.playedMoveCounters[index]);
    if (unchecked(this.primaryKillers[ply]) === move) {
      result += 32;
    }
    if (unchecked(this.secondaryKillers[ply]) === move) {
      result += 8;
    }
    return result;
  }
  resetHistory(): void {
    for (let index = 0; index < this.primaryKillers.length; index++) {
      this.primaryKillers[index] = 0;
      this.secondaryKillers[index] = 0;
    }
    for (let index = 0; index < SIZE; index++) {
      unchecked((this.cutOffMoveCounters[index] = 0));
      unchecked((this.playedMoveCounters[index] = 0));
    }
  }
}

export const history = new History();
