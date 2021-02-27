export function maskString(mask: u64): string {
  let result: string = "\n";
  for (let i: i8 = 7; i >= 0; i--) {
    for (let j: i8 = 0; j < 8; j++) {
      result += mask & (1 << (i * 8 + j)) ? "1" : ".";
    }
    result += "\n";
  }
  return result;
}

export function rookMaskAt(squareIndex: i8): u64 {
  let mask: u64 = 0;
  const y: i8 = squareIndex / 8;
  const x: i8 = squareIndex % 8;
  for (let r: i8 = y + 1; r <= 6; r++) {
    mask |= (<u64>1) << (x + r * 8);
  }
  for (let r: i8 = y - 1; r >= 1; r--) {
    mask |= (<u64>1) << (x + r * 8);
  }
  for (let c: i8 = x + 1; c <= 6; c++) {
    mask |= (<u64>1) << (c + y * 8);
  }
  for (let c: i8 = x - 1; c >= 1; c--) {
    mask |= (<u64>1) << (c + y * 8);
  }
  return mask;
}

export function bishopMaskAt(squareIndex: i8): u64 {
  let mask: u64 = 0;
  const y: i8 = squareIndex / 8;
  const x: i8 = squareIndex % 8;
  for (let r: i8 = y + 1, c: i8 = x + 1; r <= 6 && c <= 6; r++, c++) {
    mask |= (<u64>1) << (c + r * 8);
  }
  for (let r: i8 = y - 1, c: i8 = x + 1; r >= 1 && c <= 6; r--, c++) {
    mask |= (<u64>1) << (c + r * 8);
  }
  for (let r: i8 = y - 1, c: i8 = x - 1; r >= 1 && c >= 1; r--, c--) {
    mask |= (<u64>1) << (c + r * 8);
  }
  for (let r: i8 = y + 1, c: i8 = x - 1; r <= 6 && c >= 1; r++, c--) {
    mask |= (<u64>1) << (c + r * 8);
  }

  return mask;
}

export function rookAttacks(squareIndex: i8, blockerMask: u64): u64 {
  let attacks: u64 = 0;
  const y: i8 = squareIndex / 8;
  const x: i8 = squareIndex % 8;
  for (let r: i8 = y + 1; r <= 7; r++) {
    attacks |= (<u64>1) << (x + r * 8);
    if (((<u64>1) << (x + r * 8)) & blockerMask) {
      break;
    }
  }
  for (let r: i8 = y - 1; r >= 0; r--) {
    attacks |= (<u64>1) << (x + r * 8);
    if (((<u64>1) << (x + r * 8)) & blockerMask) {
      break;
    }
  }
  for (let c: i8 = x + 1; c <= 7; c++) {
    attacks |= (<u64>1) << (c + y * 8);
    if (((<u64>1) << (c + y * 8)) & blockerMask) {
      break;
    }
  }
  for (let c: i8 = x - 1; c >= 0; c--) {
    attacks |= (<u64>1) << (c + y * 8);
    if (((<u64>1) << (c + y * 8)) & blockerMask) {
      break;
    }
  }
  return attacks;
}

export function bishopAttacks(squareIndex: i8, blockerMask: u64): u64 {
  let attacks: u64 = 0;
  const y: i8 = squareIndex / 8;
  const x: i8 = squareIndex % 8;
  for (let r: i8 = y + 1, c: i8 = x + 1; r <= 7 && c <= 7; r++, c++) {
    attacks |= (<u64>1) << (c + r * 8);
    if (((<u64>1) << (c + r * 8)) & blockerMask) {
      break;
    }
  }
  for (let r: i8 = y - 1, c: i8 = x + 1; r >= 0 && c <= 7; r--, c++) {
    attacks |= (<u64>1) << (c + r * 8);
    if (((<u64>1) << (c + r * 8)) & blockerMask) {
      break;
    }
  }
  for (let r: i8 = y - 1, c: i8 = x - 1; r >= 0 && c >= 0; r--, c--) {
    attacks |= (<u64>1) << (c + r * 8);
    if (((<u64>1) << (c + r * 8)) & blockerMask) {
      break;
    }
  }
  for (let r: i8 = y + 1, c: i8 = x - 1; r <= 7 && c >= 0; r++, c--) {
    attacks |= (<u64>1) << (c + r * 8);
    if (((<u64>1) << (c + r * 8)) & blockerMask) {
      break;
    }
  }
  return attacks;
}
// code adapted from
// https://stackoverflow.com/questions/30680559/how-to-find-magic-bitboards
export function generateBlockerMask(mask: u64, index: u64): u64 {
  let blockerMask: u64 = mask;
  let bitIndex: u64 = 0;
  for (let i: i8 = 0; i < 64; i++) {
    /* Check if the i'th bit is set in the mask (and thus a potential blocker). */
    if (mask & (1 << i)) {
      /* Clear the i'th bit in the blockerboard if it's clear in the index at bitindex. */
      if (!(index & (1 << bitIndex))) {
        blockerMask &= ~(1 << i); // Clear the bit.
      }
      bitIndex++;
    }
  }
  return blockerMask;
}

export function randomInteger(): u64 {
  const u1 = <u64>(Math.random() * 2 ** 16);
  const u2 = <u64>(Math.random() * 2 ** 16);
  const u3 = <u64>(Math.random() * 2 ** 16);
  const u4 = <u64>(Math.random() * 2 ** 16);

  return u1 | (u2 << 16) | (u3 << 32) | (u4 << 48);
}

export function randomIntegerWithFewBits(): u64 {
  return randomInteger() & randomInteger() & randomInteger();
}
export function randomIntegerWithManyBits(): u64 {
  return randomInteger() | randomInteger() | randomInteger();
}

export function transformBlock2Index(
  blockerMask: u64,
  magic: u64,
  numberOfBits: i8
): i32 {
  return <i32>((blockerMask * magic) >> (<u64>(64 - numberOfBits)));
}

// prettier-ignore
export const bitsBySquareForRook = StaticArray.fromArray<i8>([
    12, 11, 11, 11, 11, 11, 11, 12,
    11, 10, 10, 10, 10, 10, 10, 11,
    11, 10, 10, 10, 10, 10, 10, 11,
    11, 10, 10, 10, 10, 10, 10, 11,
    11, 10, 10, 10, 10, 10, 10, 11,
    11, 10, 10, 10, 10, 10, 10, 11,
    11, 10, 10, 10, 10, 10, 10, 11,
    12, 11, 11, 11, 11, 11, 11, 12
]);

// prettier-ignore
export const bitsBySquareForBishop = StaticArray.fromArray<i8>([
  6, 5, 5, 5, 5, 5, 5, 6,
  5, 5, 5, 5, 5, 5, 5, 5,
  5, 5, 7, 7, 7, 7, 5, 5,
  5, 5, 7, 9, 9, 7, 5, 5,
  5, 5, 7, 9, 9, 7, 5, 5,
  5, 5, 7, 7, 7, 7, 5, 5,
  5, 5, 5, 5, 5, 5, 5, 5,
  6, 5, 5, 5, 5, 5, 5, 6
]);

export const NUMBER_OF_POSSIBLE_MASKS = 1 << 12;

export function findMagicForPieceAt(squareIndex: i8, forBishop: boolean): u64 {
  const mask = forBishop ? bishopMaskAt(squareIndex) : rookMaskAt(squareIndex);
  const numberOfBitsInMask: i32 = <i32>popcnt(mask);

  const blockerMasks = new StaticArray<u64>(NUMBER_OF_POSSIBLE_MASKS);
  const attackMasks = new StaticArray<u64>(NUMBER_OF_POSSIBLE_MASKS);
  const used = new StaticArray<u64>(NUMBER_OF_POSSIBLE_MASKS);

  const numberOfMasks: i32 = 1 << numberOfBitsInMask;
  for (let i: i32 = 0; i < numberOfMasks; i++) {
    blockerMasks[i] = generateBlockerMask(mask, i);
    attackMasks[i] = forBishop
      ? bishopAttacks(squareIndex, blockerMasks[i])
      : rookAttacks(squareIndex, blockerMasks[i]);
  }

  const numberOfBitsForIndex: i8 = forBishop
    ? bitsBySquareForBishop[squareIndex]
    : bitsBySquareForRook[squareIndex];

  // brute force loop
  for (let k: u64 = 0; k < 100000000; k++) {
    const magicCandidate = randomIntegerWithFewBits();
    if (popcnt((mask * magicCandidate) & 0xff00000000000000) < 6) {
      continue;
    }
    for (let i: i32 = 0; i < NUMBER_OF_POSSIBLE_MASKS; i++) {
      unchecked((used[i] = 0));
    }
    let fail: boolean = false;
    for (let i: i32 = 0; !fail && i < numberOfMasks; i++) {
      const j: i32 = transformBlock2Index(
        blockerMasks[i],
        magicCandidate,
        numberOfBitsForIndex
      );
      const usedValue = unchecked(used[j]);
      const attackMasksValue = unchecked(attackMasks[i]);
      if (usedValue == 0) {
        unchecked((used[j] = attackMasksValue));
      } else if (usedValue != attackMasksValue) {
        fail = true;
      }
    }
    if (!fail) return magicCandidate;
  }

  // big fail
  return 0;
}

export function findAllRookMagicNumbers(): StaticArray<u64> {
  const magicNumbers = new StaticArray<u64>(64);
  for (let i: i8 = 0; i < 64; i++) {
    magicNumbers[i] = findMagicForPieceAt(i, false);
  }
  return magicNumbers;
}
export function findAllBishopMagicNumbers(): StaticArray<u64> {
  const magicNumbers = new StaticArray<u64>(64);
  for (let i: i8 = 0; i < 64; i++) {
    magicNumbers[i] = findMagicForPieceAt(i, true);
  }
  return magicNumbers;
}
