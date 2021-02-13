import { Position } from "./chess";

export interface BitsIterator {
  index: number;
  hasNext(): boolean;
  next(): boolean;
}

export const indexToPosition = (index: number): Position => {
  const x = ((1 << 3) - 1) & index;
  const y = index >> 3;
  return {
    x,
    y,
  };
};

export const positionToIndex = (pos: Position): number => (pos.y << 3) + pos.x;

export class Bits {
  constructor(private first32b: number = 0, private second32b: number = 0) {}

  clone(): Bits {
    return new Bits(this.first32b, this.second32b);
  }

  iterator(): BitsIterator {
    let data = this.first32b;
    let second32b = this.second32b;
    let index = 0;
    return {
      get index() {
        return index;
      },
      hasNext(): boolean {
        return index < 64;
      },
      next(): boolean {
        if (index === 32) {
          data = second32b;
        }
        const result = !!(data & 1);
        data = data >> 1;
        index++;
        return result;
      },
    };
  }

  set(index: number, value: boolean) {
    const b = value ? 1 : 0;
    if (index < 32) {
      if (value) {
        this.first32b = this.first32b | (b << index);
      } else {
        this.first32b = this.first32b & ~(1 << index);
      }
    } else {
      if (value) {
        this.second32b = this.second32b | (b << index);
      } else {
        this.second32b = this.second32b & ~(1 << index);
      }
    }
  }

  get(index: number): boolean {
    if (index < 32) {
      return !!((this.first32b >> index) & 1);
    }
    return !!((this.second32b >> index) & 1);
  }

  and(bits: Bits): Bits {
    return new Bits(
      this.first32b & bits.first32b,
      this.second32b & bits.second32b
    );
  }

  setAtPosition(pos: Position, value: boolean) {
    const index = (pos.y << 3) + pos.x;
    this.set(index, value);
  }
  getAtPosition(pos: Position): boolean {
    return this.get((pos.y << 3) + pos.x);
  }

  getFirstBitIndex(): number {
    for (let index = 0; index < 64; index++) {
      if (this.get(index)) {
        return index;
      }
    }
    throw new Error("No bit found");
  }

  getPositions(): Position[] {
    const it = this.iterator();
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
    return (
      this.first32b === other.first32b && this.second32b === other.second32b
    );
  }
}
