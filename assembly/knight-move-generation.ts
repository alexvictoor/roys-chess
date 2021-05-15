import {
  BitBoard,
  encodeCapture,
  encodeMove,
  KNIGHT,
  MaskIterator,
  opponent,
} from "./bitboard";
import { getKnightMoves } from "./knight";

const knightMoveCache: StaticArray<u64> = new StaticArray<u64>(64);
function initKnightMoveCache(): void {
  for (let position: i8 = 0; position < 64; position++) {
    knightMoveCache[position] = getKnightMoves(position);
  }
}
initKnightMoveCache();

export function knightMovesFromCache(pos: i8): u64 {
  return unchecked(knightMoveCache[pos]);
}

const positions = new MaskIterator();
const toPositions = new MaskIterator();
const capturePositions = new MaskIterator();

export function addKnightPseudoLegalMoves(
  moves: u32[],
  board: BitBoard,
  player: i8
): void {
  const allPiecesMask = board.getAllPiecesMask();
  const knightMask = board.getKnightMask(player);
  const opponentPlayer = opponent(player);
  positions.reset(knightMask);
  while (positions.hasNext()) {
    const from = positions.next();
    const mask = knightMovesFromCache(from);
    const moveMask = mask & ~allPiecesMask;
    toPositions.reset(moveMask);
    while (toPositions.hasNext()) {
      moves.push(
        encodeMove(KNIGHT + player, from, KNIGHT + player, toPositions.next())
      );
    }
    const captureMask = mask & board.getPlayerPiecesMask(opponentPlayer);
    capturePositions.reset(captureMask);
    while (capturePositions.hasNext()) {
      const capturePosition = capturePositions.next();
      moves.push(
        encodeCapture(
          KNIGHT + player,
          from,
          KNIGHT + player,
          capturePosition,
          board.getPieceAt(capturePosition)
        )
      );
    }
  }
}

export function addKnightPseudoLegalCaptures(
  moves: u32[],
  board: BitBoard,
  player: i8
): void {
  const knightMask = board.getKnightMask(player);
  const opponentPlayer = opponent(player);
  positions.reset(knightMask);
  while (positions.hasNext()) {
    const from = positions.next();
    const mask = knightMovesFromCache(from);
    const captureMask = mask & board.getPlayerPiecesMask(opponentPlayer);
    capturePositions.reset(captureMask);
    while (capturePositions.hasNext()) {
      const capturePosition = capturePositions.next();
      const capturedPiece = board.getPieceAt(capturePosition);
      const captureAction = encodeCapture(
        KNIGHT + player,
        from,
        KNIGHT + player,
        capturePosition,
        board.getPieceAt(capturePosition)
      );
      if (capturedPiece > KNIGHT) {
        moves.unshift(captureAction);
      } else {
        moves.push(captureAction);
      }
    }
  }
}
