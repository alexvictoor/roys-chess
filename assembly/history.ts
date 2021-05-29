import { decodeFromPosition, decodeToPosition } from "./bitboard";
const SIZE = 2 * 64 * 64;
export class History {
  private playedMoveCounters: StaticArray<i16> = new StaticArray<i16>(SIZE);
  private cutOffMoveCounters: StaticArray<i16> = new StaticArray<i16>(SIZE);

  private primaryKillers: StaticArray<u32> = new StaticArray<u32>(12);
  private secondaryKillers: StaticArray<u32> = new StaticArray<u32>(12);

  @inline
  private computeMoveIndex(player: i8, move: u32): i32 {
    return (
      ((((<i32>decodeFromPosition(move)) << 6) + <i32>decodeToPosition(move)) <<
        1) +
      player
    );
  }
  @inline
  recordPlayedMove(player: i8, ply: i8, move: u32): void {
    unchecked(
      (this.playedMoveCounters[this.computeMoveIndex(player, move)] += 1)
    );
  }
  @inline
  recordCutOffMove(player: i8, ply: i8, depth: i8, move: u32): void {
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
  getMoveScore(player: i8, ply: i8, move: u32): i16 {
    //log(this.cutOffMoveCounters[this.computeMoveIndex(player, move)]);

    const index = this.computeMoveIndex(player, move);
    const cutOff = unchecked(this.cutOffMoveCounters[index]);
    /*if (cutOff === 0) {
      return 0;
    }*/
    let result: i16 = cutOff - unchecked(this.playedMoveCounters[index]);
    if (unchecked(this.primaryKillers[ply]) === move) {
      result += 400;
    }
    if (unchecked(this.secondaryKillers[ply]) === move) {
      result += 200;
    }
    //return cutOff;
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
