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
    //trace(ply.toString() +  ' ' +(1 << ply).toString());
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

    
    /*if (cutOff === 0) {
      return 0;
    }*/
   
    if (unchecked(this.primaryKillers[ply]) === move) {
      return i16.MAX_VALUE >> 1;
    }
    if (unchecked(this.secondaryKillers[ply]) === move) {
      return i16.MAX_VALUE >> 2;
    }
    //return cutOff;
    const index = this.computeMoveIndex(player, move);
    const cutOff = unchecked(this.cutOffMoveCounters[index]);
    if (cutOff === 0) {
      return 0;
    }
    return i16(<i32>cutOff * <i32>500 / <i32>unchecked(this.playedMoveCounters[index]) );
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
