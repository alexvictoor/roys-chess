import { Position } from "./chess";

export class BitsIterator {
  constructor(private data: i64 = 0) {}
  index: i8;
  hasNext(): boolean {
    return this.index < 64;
  }
  next(): boolean {
    const result = !!(this.data & 1);
    this.data = this.data >> 1;
    this.index++;
    return result;
  }
}

export const indexToPosition = (index: i8): Position => {
  const x = (((<i8>1) << 3) - 1) & index;
  const y = index >> 3;
  return {
    x,
    y,
  };
};

export const positionToIndex = (pos: Position): i8 => (pos.y << 3) + pos.x;

export class Bits {
  constructor(private data: i64 = 0) {}

  clone(): Bits {
    return new Bits(this.data);
  }

  iterator(): BitsIterator {
    return new BitsIterator(this.data);
  }

  set(index: i8, value: boolean): void {
    const b: i64 = value ? 1 : 0;

    if (value) {
      this.data = this.data | (b << index);
    } else {
      this.data = this.data & ~(1 << index);
    }
  }

  get(index: i8): bool {
    return !!((this.data >> index) & 1);
  }

  and(bits: Bits): Bits {
    return new Bits(this.data & bits.data);
  }

  setAtPosition(pos: Position, value: boolean): void {
    const index = (pos.y << 3) + pos.x;
    this.set(index, value);
  }
  getAtPosition(pos: Position): bool {
    return this.get((pos.y << 3) + pos.x);
  }

  getFirstBitIndex(): i8 {
    for (let index: i8 = 0; index < 64; index++) {
      if (this.get(index)) {
        return index;
      }
    }
    throw new Error("No bit found");
  }

  getPositions(): Position[] {
    const it = new BitsIterator(this.data);
    const result: Position[] = [];
    while (it.hasNext()) {
      const index = it.index;
      if (it.next()) {
        result.push(indexToPosition(index));
      }
    }
    return result;
  }

  getFirstBitPosition(): Position {
    const index = this.getFirstBitIndex();
    return indexToPosition(index);
  }

  equals(other: Bits): boolean {
    if (this === other) {
      return true;
    }
    return this.data === other.data;
  }
}
