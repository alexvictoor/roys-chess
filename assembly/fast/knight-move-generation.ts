import {
  BitBoard,
  encodeCapture,
  encodeMove,
  getPositionsFromMask,
  KNIGHT,
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

export function addKnightPseudoLegalMoves(
  moves: u64[],
  board: BitBoard,
  player: i8
): void {
  const allPiecesMask = board.getAllPiecesMask();
  const knightMask = board.getKnightMask(player);
  const positions = getPositionsFromMask(knightMask);
  for (let i = 0; i < positions.length; i++) {
    const from = positions[i];
    const mask = knightMovesFromCache(from);
    const moveMask = mask & ~allPiecesMask;
    const toPositions = getPositionsFromMask(moveMask);
    for (let j = 0; j < toPositions.length; j++) {
      moves.push(
        encodeMove(KNIGHT + player, from, KNIGHT + player, toPositions[j])
      );
    }
    const captureMask = mask & board.getPlayerPiecesMask(opponent(player));
    const capturePositions = getPositionsFromMask(captureMask);
    for (let j = 0; j < capturePositions.length; j++) {
      moves.push(
        encodeCapture(
          KNIGHT + player,
          from,
          KNIGHT + player,
          capturePositions[j],
          board.getPieceAt(capturePositions[j])
        )
      );
    }
  }
}
