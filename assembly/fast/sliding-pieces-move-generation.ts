import {
  BISHOP,
  BitBoard,
  encodeCapture,
  encodeMove,
  MaskIterator,
  opponent,
  QUEEN,
  ROOK,
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

const rookMaskCache: StaticArray<u64> = new StaticArray<u64>(64);
const rookMoveCache: StaticArray<u64>[] = [];
function initRookMoveCache(): void {
  for (let squareIndex: i8 = 0; squareIndex < 64; squareIndex++) {
    const numberOfBitsForIndex: i8 = bitsBySquareForRook[squareIndex];
    const attackMasks = new StaticArray<u64>(1 << numberOfBitsForIndex);
    const mask = rookMaskAt(squareIndex);
    rookMaskCache[squareIndex] = mask;
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

const bishopMaskCache: StaticArray<u64> = new StaticArray<u64>(64);
const bishopMoveCache: StaticArray<u64>[] = [];
function initBishopMoveCache(): void {
  for (let squareIndex: i8 = 0; squareIndex < 64; squareIndex++) {
    const numberOfBitsForIndex: i8 = bitsBySquareForBishop[squareIndex];
    const attackMasks = new StaticArray<u64>(1 << numberOfBitsForIndex);
    const mask = bishopMaskAt(squareIndex);
    bishopMaskCache[squareIndex] = mask;
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
  const blockerMask = board & rookMaskCache[rookPosition];
  const magicIndex: i32 = transformBlock2Index(
    blockerMask,
    unchecked(rookMagicNumbers[rookPosition]),
    unchecked(bitsBySquareForRook[rookPosition])
  );
  return unchecked(rookMoveCache[rookPosition][magicIndex]);
}

const positions = new MaskIterator();
const toPositions = new MaskIterator();
const capturePositions = new MaskIterator();

export function addRookPseudoLegalMoves(
  moves: u64[],
  board: BitBoard,
  player: i8
): void {
  const allPiecesMask = board.getAllPiecesMask();
  const rookMask = board.getRookMask(player);
  positions.reset(rookMask);
  while (positions.hasNext()) {
    const from = positions.next();
    const mask = rookMoves(allPiecesMask, from);
    const moveMask = mask & ~allPiecesMask;
    toPositions.reset(moveMask);
    while (toPositions.hasNext()) {
      moves.push(
        encodeMove(ROOK + player, from, ROOK + player, toPositions.next())
      );
    }
    const captureMask = mask & board.getPlayerPiecesMask(opponent(player));
    capturePositions.reset(captureMask);
    while (capturePositions.hasNext()) {
      const c = capturePositions.next();
      moves.push(
        encodeCapture(
          ROOK + player,
          from,
          ROOK + player,
          c,
          board.getPieceAt(c)
        )
      );
    }
  }
}

export function bishopMoves(mask: u64, bishopPosition: i8): u64 {
  const blockerMask = mask & bishopMaskCache[bishopPosition];
  const magicIndex: i32 = transformBlock2Index(
    blockerMask,
    unchecked(bishopMagicNumbers[bishopPosition]),
    unchecked(bitsBySquareForBishop[bishopPosition])
  );
  return unchecked(bishopMoveCache[bishopPosition][magicIndex]);
}

export function queenMoves(board: u64, queenPosition: i8): u64 {
  return bishopMoves(board, queenPosition) | rookMoves(board, queenPosition);
}

export function addBishopPseudoLegalMoves(
  moves: u64[],
  board: BitBoard,
  player: i8
): void {
  const allPiecesMask = board.getAllPiecesMask();
  const bishopMask = board.getBishopMask(player);
  positions.reset(bishopMask);
  while (positions.hasNext()) {
    const from = positions.next();
    const mask = bishopMoves(allPiecesMask, from);
    const moveMask = mask & ~allPiecesMask;
    toPositions.reset(moveMask);
    while (toPositions.hasNext()) {
      moves.push(
        encodeMove(BISHOP + player, from, BISHOP + player, toPositions.next())
      );
    }
    const captureMask = mask & board.getPlayerPiecesMask(opponent(player));
    capturePositions.reset(captureMask);
    while (capturePositions.hasNext()) {
      const c = capturePositions.next();
      moves.push(
        encodeCapture(
          BISHOP + player,
          from,
          BISHOP + player,
          c,
          board.getPieceAt(c)
        )
      );
    }
  }
}
export function addQueenPseudoLegalMoves(
  moves: u64[],
  board: BitBoard,
  player: i8
): void {
  const allPiecesMask = board.getAllPiecesMask();
  const queenMask = board.getQueenMask(player);
  positions.reset(queenMask);
  while (positions.hasNext()) {
    const from = positions.next();
    const mask = queenMoves(allPiecesMask, from);
    const moveMask = mask & ~allPiecesMask;
    toPositions.reset(moveMask);
    while (toPositions.hasNext()) {
      moves.push(
        encodeMove(QUEEN + player, from, QUEEN + player, toPositions.next())
      );
    }
    const captureMask = mask & board.getPlayerPiecesMask(opponent(player));
    capturePositions.reset(captureMask);
    while (capturePositions.hasNext()) {
      const c = capturePositions.next();
      moves.push(
        encodeCapture(
          QUEEN + player,
          from,
          QUEEN + player,
          c,
          board.getPieceAt(c)
        )
      );
    }
  }
}
