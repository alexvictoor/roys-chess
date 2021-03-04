import {
  BitBoard,
  encodeCapture,
  encodeMove,
  getPositionsFromMask,
  KING,
  opponent,
} from "./bitboard";
import { getKingMoves } from "./king";

const kingMoveCache: StaticArray<u64> = new StaticArray<u64>(64);
function initKingMoveCache(): void {
  for (let position: i8 = 0; position < 64; position++) {
    kingMoveCache[position] = getKingMoves(position);
  }
}
initKingMoveCache();

export function kingMoves(pos: i8): u64 {
  return kingMoveCache[pos];
}

export function addKingPseudoLegalMoves(
  moves: u64[],
  board: BitBoard,
  player: i8
): void {
  const allPiecesMask = board.getAllPiecesMask();
  const knightMask = board.getKingMask(player);
  const positions = getPositionsFromMask(knightMask);
  for (let i = 0; i < positions.length; i++) {
    const from = positions[i];
    const mask = kingMoves(from);
    const moveMask = mask & ~allPiecesMask;
    const toPositions = getPositionsFromMask(moveMask);
    for (let j = 0; j < toPositions.length; j++) {
      moves.push(
        encodeMove(KING + player, from, KING + player, toPositions[j])
      );
    }
    const captureMask = mask & board.getPlayerPiecesMask(opponent(player));
    const capturePositions = getPositionsFromMask(captureMask);
    for (let j = 0; j < capturePositions.length; j++) {
      moves.push(
        encodeCapture(
          KING + player,
          from,
          KING + player,
          capturePositions[j],
          board.getPieceAt(capturePositions[j])
        )
      );
    }
  }
}
