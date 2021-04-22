import {
  BitBoard,
  encodeCapture,
  encodeMove,
  KING,
  MaskIterator,
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
  return unchecked(kingMoveCache[pos]);
}

const positions = new MaskIterator();
const toPositions = new MaskIterator();
const capturePositions = new MaskIterator();

export function addKingPseudoLegalMoves(
  moves: u32[],
  board: BitBoard,
  player: i8
): void {
  const allPiecesMask = board.getAllPiecesMask();
  const knightMask = board.getKingMask(player);
  const opponentPlayer = opponent(player);
  positions.reset(knightMask);
  while (positions.hasNext()) {
    const from = positions.next();
    const mask = kingMoves(from);
    const moveMask = mask & ~allPiecesMask;
    toPositions.reset(moveMask);
    while (toPositions.hasNext()) {
      moves.push(
        encodeMove(KING + player, from, KING + player, toPositions.next())
      );
    }
    const captureMask = mask & board.getPlayerPiecesMask(opponentPlayer);
    capturePositions.reset(captureMask);
    while (capturePositions.hasNext()) {
      const c = capturePositions.next();
      moves.push(
        encodeCapture(
          KING + player,
          from,
          KING + player,
          c,
          board.getPieceAt(c)
        )
      );
    }
  }
}

export function addKingPseudoLegalCaptures(
  moves: u32[],
  board: BitBoard,
  player: i8
): void {
  const knightMask = board.getKingMask(player);
  const opponentPlayer = opponent(player);
  positions.reset(knightMask);
  while (positions.hasNext()) {
    const from = positions.next();
    const mask = kingMoves(from);
    const captureMask = mask & board.getPlayerPiecesMask(opponentPlayer);
    capturePositions.reset(captureMask);
    while (capturePositions.hasNext()) {
      const c = capturePositions.next();
      moves.push(
        encodeCapture(
          KING + player,
          from,
          KING + player,
          c,
          board.getPieceAt(c)
        )
      );
    }
  }
}
