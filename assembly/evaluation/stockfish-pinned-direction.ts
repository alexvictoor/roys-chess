import { firstColMask, firstRowMask } from "../bitboard";


export function pinnedDirection(kingPos: i8, pos: i8): i32 {
  const kingX = kingPos & 7;
  const kingY = kingPos >> 3;
  const x = pos & 7;
  const y = pos >> 3;
  if (kingY == y) {
    return 1;
  } 
  if (kingX == x) {
    return 3;
  }
  if ((x > kingX) == (y > kingY)) {
    return 4;
  }
  return 2;
}

const pinnedDirectionCache: StaticArray<u64> = new StaticArray<u64>(256);
export function initPinnedDirectionCache(): void {
  for (let position: i8 = 0; position < 64; position++) {
    pinnedDirectionCache[position] = firstRowMask << (position & ~7);
  }
  let x: i8 = 0;
  
  for (let index: i8 = 0; index < 8; index++) {
    let mask: u64 = 0;
    for (let y: i8 = index, x: i8 = 0; y >= 0; y--, x++) {
      mask |= 1 << ((<u64>y << 3) + <u64>x);
    }
    for (let y: i8 = index, x: i8 = 0; y >= 0; y--, x++) {
      pinnedDirectionCache[64 + (y << 3) + x] = mask;
    }
    mask = 0;
    for (let y: i8 = 7, x: i8 = index; x < 8; y--, x++) {
      mask |= 1 << ((<u64>y << 3) + <u64>x);
    }
    for (let y: i8 = 7, x: i8 = index; x < 8; y--, x++) {
      pinnedDirectionCache[64 + (y << 3) + x] = mask;
    }
    mask = 0;
    for (let y: i8 = 7 - index, x: i8 = 7; y >= 0; y--, x--) {
      mask |= 1 << ((<u64>y << 3) + <u64>x);
    }
    for (let y: i8 = 7 - index, x: i8 = 7; y >= 0; y--, x--) {
      pinnedDirectionCache[192 + (y << 3) + x] = mask;
    }
    mask = 0;
    for (let y: i8 = 7, x: i8 = 7 - index; x >= 0; y--, x--) {
      mask |= 1 << ((<u64>y << 3) + <u64>x);
    }
    for (let y: i8 = 7, x: i8 = 7 - index; x >= 0; y--, x--) {
      pinnedDirectionCache[192 + (y << 3) + x] = mask;
    }
  }  

  for (let position: i8 = 0; position < 64; position++) {
    pinnedDirectionCache[position + 128] = firstColMask << (position & 7);
  }
}
initPinnedDirectionCache();

export function pinnedDirectionMask(kingPos: i8, pos: i8): u64 {
  return unchecked(pinnedDirectionCache[(pinnedDirection(kingPos, pos) - 1) * 64 + pos]);
}