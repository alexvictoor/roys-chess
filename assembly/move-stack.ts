// Move lists live in one preallocated arena so that move generation never
// allocates during the search. Every ply of the search owns a fixed slot.
export const MOVES_PER_PLY: i32 = 256;
export const MAX_PLY: i32 = 128;

const arena = new StaticArray<u32>(MOVES_PER_PLY * MAX_PLY);
const quiescenceArena = new StaticArray<u32>(MOVES_PER_PLY * MAX_PLY);

export class MoveStack {
  moves: StaticArray<u32>;
  base: i32;
  count: i32;

  constructor(moves: StaticArray<u32> = new StaticArray<u32>(MOVES_PER_PLY), base: i32 = 0) {
    this.moves = moves;
    this.base = base;
    this.count = 0;
  }

  @inline
  push(move: u32): void {
    unchecked((this.moves[this.base + this.count++] = move));
  }

  @inline
  at(index: i32): u32 {
    return unchecked(this.moves[this.base + index]);
  }

  @inline
  set(index: i32, move: u32): void {
    unchecked((this.moves[this.base + index] = move));
  }

  @inline
  clear(): void {
    this.count = 0;
  }

  /** Copy the moves out (used by perft / tests) and reset the stack. */
  flush(): StaticArray<u32> {
    const result = StaticArray.slice(this.moves, this.base, this.base + this.count);
    this.count = 0;
    return result;
  }
}

const plyStacks: StaticArray<MoveStack> = new StaticArray<MoveStack>(MAX_PLY);
const quiescenceStacks: StaticArray<MoveStack> = new StaticArray<MoveStack>(MAX_PLY);
for (let ply = 0; ply < MAX_PLY; ply++) {
  plyStacks[ply] = new MoveStack(arena, ply * MOVES_PER_PLY);
  quiescenceStacks[ply] = new MoveStack(quiescenceArena, ply * MOVES_PER_PLY);
}

/** Move list reserved for the main search at this ply. */
@inline
export function moveStackForPly(ply: i32): MoveStack {
  return unchecked(plyStacks[ply]);
}

/** Move list reserved for the quiescence search at this ply. */
@inline
export function quiescenceStackForPly(ply: i32): MoveStack {
  return unchecked(quiescenceStacks[ply]);
}
