import { bishopMagicNumbers } from "./generated-bishop-magic";
import { rookMagicNumbers } from "./generated-rook-magic";
import {
  bishopAttacks,
  bishopMaskAt,
  bitsBySquareForBishop,
  bitsBySquareForRook,
  generateBlockerMask,
  rookAttacks,
  rookMaskAt,
  transformBlock2Index,
} from "./magic";

const rookMoveDb: StaticArray<u64>[] = [];
function initRookMoveDb(): void {
  for (let squareIndex: i8 = 0; squareIndex < 64; squareIndex++) {
    const numberOfBitsForIndex: i8 = bitsBySquareForRook[squareIndex];
    const attackMasks = new StaticArray<u64>(1 << numberOfBitsForIndex);
    const mask = rookMaskAt(squareIndex);
    const numberOfBitsInMask: i32 = <i32>popcnt(mask);
    const numberOfMasks: i32 = 1 << numberOfBitsInMask;
    for (let i: i32 = 0; i < numberOfMasks; i++) {
      const blockerMask = generateBlockerMask(mask, i);
      const magicIndex: i32 = transformBlock2Index(
        blockerMask,
        rookMagicNumbers[squareIndex],
        numberOfBitsForIndex
      );
      attackMasks[magicIndex] = rookAttacks(squareIndex, blockerMask);
    }
    rookMoveDb[squareIndex] = attackMasks;
  }
}
initRookMoveDb();

const bishopMoveDb: StaticArray<u64>[] = [];
function initBishopMoveDb(): void {
  for (let squareIndex: i8 = 0; squareIndex < 64; squareIndex++) {
    const numberOfBitsForIndex: i8 = bitsBySquareForBishop[squareIndex];
    const attackMasks = new StaticArray<u64>(1 << numberOfBitsForIndex);
    const mask = bishopMaskAt(squareIndex);
    const numberOfBitsInMask: i32 = <i32>popcnt(mask);
    const numberOfMasks: i32 = 1 << numberOfBitsInMask;
    for (let i: i32 = 0; i < numberOfMasks; i++) {
      const blockerMask = generateBlockerMask(mask, i);
      const magicIndex: i32 = transformBlock2Index(
        blockerMask,
        bishopMagicNumbers[squareIndex],
        numberOfBitsForIndex
      );
      attackMasks[magicIndex] = bishopAttacks(squareIndex, blockerMask);
    }
    bishopMoveDb[squareIndex] = attackMasks;
  }
}
initBishopMoveDb();

const noBorderMask: u64 =
  (((1 << 48) - 1) << 8) ^
  ((1 << 8) | (1 << 16) | (1 << 24) | (1 << 32) | (1 << 40) | (1 << 48)) ^
  ((1 << 15) | (1 << 23) | (1 << 31) | (1 << 39) | (1 << 47) | (1 << 55));

export function rookPseudoLegalMoves(board: u64, rookPosition: i8): u64 {
  const blockerMask = board & noBorderMask & ~(1 << rookPosition);
  const magicIndex: i32 = transformBlock2Index(
    blockerMask,
    rookMagicNumbers[rookPosition],
    bitsBySquareForRook[rookPosition]
  );
  return rookMoveDb[rookPosition][magicIndex];
}

export function bishopPseudoLegalMoves(board: u64, bishopPosition: i8): u64 {
  const blockerMask = board & noBorderMask & ~(1 << bishopPosition);
  const magicIndex: i32 = transformBlock2Index(
    blockerMask,
    bishopMagicNumbers[bishopPosition],
    bitsBySquareForBishop[bishopPosition]
  );
  return bishopMoveDb[bishopPosition][magicIndex];
}
