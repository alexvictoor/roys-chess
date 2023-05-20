import { BitBoard, BLACK, firstColMask, maskString, WHITE } from "../bitboard";
import { candidatePassedMask } from "./stockfish-passed-pawns";

const leftFlankMask =
  firstColMask |
  (firstColMask << 1) |
  (firstColMask << 2) |
  (firstColMask << 3);

const rightFlankMask = leftFlankMask << 4

export function winnable(board: BitBoard): i16 {
  const pawnMask = board.getPawnMask(WHITE) | board.getPawnMask(BLACK);
  const pawns = <i16>popcnt(pawnMask);

  const bothFlanks = !!(pawnMask & leftFlankMask) && !!(pawnMask & rightFlankMask);
  const passedCount = <i16>popcnt(candidatePassedMask(board, WHITE)) + <i16>popcnt(candidatePassedMask(board, BLACK));

  const whiteKingPos = <i8>ctz(board.getKingMask(WHITE));
  const blackKingPos = <i8>ctz(board.getKingMask(BLACK));
  const whiteKingY = whiteKingPos >> 3;
  const blackKingY = blackKingPos >> 3;
  const outflanking = <i16>Math.abs((whiteKingPos & 7) - (blackKingPos & 7)) -  <i16>Math.abs(whiteKingY - blackKingY);
  const purePawn = !(board.getAllPiecesMask() & ~pawns & ~board.getKingMask(WHITE) & ~board.getKingMask(BLACK));
  const almostUnwinnable = outflanking < 0 && !bothFlanks;
  const infiltration = whiteKingY > 3 || blackKingY < 4;
  let result: i16 = (9 * passedCount) + (12 * pawns) + (9 * outflanking) - 110;
  if (bothFlanks) {
    result += 21;
  }
  if (infiltration) {
    result += 24;
  }
  if (purePawn) {
    result += 51;
  }
  if (almostUnwinnable) {
    result -= 43;
  }
  return result;
}

export function winnableTotalMg(board: BitBoard, evaluation: i16): i16 {
    if (evaluation === 0) {
        return 0;
    }
    const factor: i16 = evaluation > 0 ? 1 : -1;
    return factor * <i16>Math.max(Math.min(winnable(board) + 50, 0), -Math.abs(evaluation));
  }

export function winnableTotalEg(board: BitBoard, evaluation: i16): i16 {
    if (evaluation === 0) {
        return 0;
    }
    const factor: i16 = evaluation > 0 ? 1 : -1;
    return factor * <i16>Math.max(winnable(board), -Math.abs(evaluation));
  }