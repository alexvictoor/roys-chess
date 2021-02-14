import { Bits } from "../bits";
import { Position } from "../chess";

describe("64 bits", () => {
  it("should store booleans true", () => {
    // given
    const randomIndexs: i8[] = [0, 17, 26, 32, 42, 63];
    const bits = new Bits();
    // when
    for (let index: i8 = 0; index < randomIndexs.length; index++) {
      bits.set(randomIndexs[index], true);
    }
    // then
    for (let index: i8 = 0; index < 64; index++) {
      expect<bool>(bits.get(index)).toBe(randomIndexs.includes(index));
    }
  });
  it("should store booleans false", () => {
    // given
    const randomIndexs: i8[] = [0, 17, 26, 32, 42, 63];
    const bits = new Bits();
    // when
    for (let index: i8 = 0; index < randomIndexs.length; index++) {
      bits.set(randomIndexs[index], true);
    }
    for (let index: i8 = 0; index < randomIndexs.length; index++) {
      bits.set(randomIndexs[index], false);
    }
    // then
    for (let index: i8 = 0; index < 64; index++) {
      expect(bits.get(index)).toBe(false);
    }
  });

  it("should and", () => {
    // given
    const bits1 = new Bits();
    bits1.set(0, true);
    bits1.set(10, true);
    bits1.set(50, true);
    const bits2 = new Bits();
    bits2.set(0, true);
    bits2.set(50, true);
    bits2.set(51, true);
    // when
    const result = bits1.and(bits2);
    // then
    for (let index: i8 = 0; index < 64; index++) {
      expect(result.get(index)).toBe([0, 50].includes(index));
    }
  });

  it("should find bit at position", () => {
    // given
    const bits = new Bits();
    bits.set(11, true);
    const position: Position = { x: 3, y: 1 };
    // when
    const value = bits.getAtPosition(position);
    // then
    expect(value).toBe(true);
  });
  it("should set bit at position", () => {
    // given
    const bits = new Bits();
    const position: Position = { x: 3, y: 1 };
    // when
    bits.setAtPosition(position, true);
    const value = bits.getAtPosition(position);
    // then
    expect(value).toBe(true);
  });
  it("should get position of first bit found", () => {
    // given
    const bits = new Bits();
    const position: Position = { x: 3, y: 4 };
    bits.setAtPosition(position, true);
    // when
    const foundPosition = bits.getFirstBitPosition();
    // then
    expect(foundPosition).toStrictEqual(position);
  });

  it("should get positions where bit is set to 1", () => {
    // given
    const bits = new Bits();
    bits.setAtPosition({ x: 3, y: 4 }, true);
    bits.setAtPosition({ x: 5, y: 5 }, true);
    // when
    const positions = bits.getPositions();
    // then
    expect(positions).toStrictEqual([
      { x: 3, y: 4 },
      { x: 5, y: 5 },
    ]);
  });

  it("should clone data", () => {
    // given
    const bits = new Bits();
    const position: Position = { x: 3, y: 4 };
    bits.setAtPosition(position, true);
    // when
    const copy = bits.clone();
    // then
    expect(copy.getAtPosition(position)).toBe(true);
  });

  it("should iterate on first bits", () => {
    // given
    const bits = new Bits();
    bits.set(2, true);
    // when
    const it = bits.iterator();
    // then
    expect(it.hasNext()).toBe(true);
    expect(it.next()).toBe(false);
    expect(it.next()).toBe(false);
    expect(it.next()).toBe(true);
  });

  it("should stop iterating when no data left", () => {
    // given
    const bits = new Bits();
    const it = bits.iterator();
    // when
    for (let index = 0; index < 64; index++) {
      it.next();
    }
    // then
    expect(it.hasNext()).toBe(false);
  });

  it("should iterate on last bits", () => {
    // given
    const bits = new Bits();
    bits.set(32, true);
    // when
    const it = bits.iterator();
    // then
    for (let index = 0; index < 32; index++) {
      it.next();
    }
    expect(it.next()).toBe(true);
  });

  it("should compare bits", () => {
    // given
    const bits1 = new Bits();
    bits1.set(42, true);
    const bits2 = new Bits();
    bits2.set(42, true);
    const bits3 = new Bits();
    bits3.set(42, true);
    bits3.set(70, true);
    // when
    // then
    expect(bits1.equals(bits2)).toBe(true);
    expect(bits1.equals(bits3)).toBe(false);
  });
});
