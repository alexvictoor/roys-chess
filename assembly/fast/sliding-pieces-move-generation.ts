import {
  BISHOP,
  BitBoard,
  encodeCapture,
  encodeMove,
  getPositionsFromMask,
  noBorderMask,
  opponent,
} from "./bitboard";
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

const rookMoveCache: StaticArray<u64>[] = [];
function initRookMoveCache(): void {
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
    rookMoveCache[squareIndex] = attackMasks;
  }
}
initRookMoveCache();

const bishopMoveCache: StaticArray<u64>[] = [];
function initBishopMoveCache(): void {
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
    bishopMoveCache[squareIndex] = attackMasks;
  }
}
initBishopMoveCache();

export function rookMoves(board: u64, rookPosition: i8): u64 {
  const blockerMask = board & noBorderMask & ~(1 << rookPosition);
  const magicIndex: i32 = transformBlock2Index(
    blockerMask,
    rookMagicNumbers[rookPosition],
    bitsBySquareForRook[rookPosition]
  );
  return rookMoveCache[rookPosition][magicIndex];
}

export function bishopMoves(mask: u64, bishopPosition: i8): u64 {
  const blockerMask = mask & noBorderMask & ~(1 << bishopPosition);
  const magicIndex: i32 = transformBlock2Index(
    blockerMask,
    bishopMagicNumbers[bishopPosition],
    bitsBySquareForBishop[bishopPosition]
  );
  return bishopMoveCache[bishopPosition][magicIndex];
}

export function queenMoves(board: u64, queenPosition: i8): u64 {
  return bishopMoves(board, queenPosition) | rookMoves(board, queenPosition);
}

export function bishopPseudoLegalMoves(board: BitBoard, player: i8): u64[] {
  const allPiecesMask = board.getAllPiecesMask();
  const friendlyPiecesMask = board.getPlayerPiecesMask(player);
  const bishopMask = board.getBishopMask(player);
  const positions = getPositionsFromMask(bishopMask);
  const result: u64[] = [];
  for (let i = 0; i < positions.length; i++) {
    const from = positions[i];
    const mask = bishopMoves(allPiecesMask, from);
    const moveMask = mask & ~allPiecesMask;
    const toPositions = getPositionsFromMask(moveMask);
    for (let j = 0; j < toPositions.length; j++) {
      result.push(encodeMove(BISHOP + player, from, toPositions[j]));
    }
    const captureMask = mask & board.getPlayerPiecesMask(opponent(player));
    const capturePositions = getPositionsFromMask(captureMask);
    for (let j = 0; j < capturePositions.length; j++) {
      result.push(
        encodeCapture(
          BISHOP + player,
          from,
          capturePositions[j],
          board.getPieceAt(capturePositions[j])
        )
      );
    }
  }
  return result;
}

export function bishopLegalMoves(board: BitBoard, player: i8): u64[] {
  // move BitBoard + u64
  throw "not implemented";
}
