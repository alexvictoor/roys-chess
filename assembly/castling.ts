import {
  BISHOP,
  BitBoard,
  BLACK,
  encodeMove,
  KING,
  ROOK,
  WHITE,
} from "./bitboard";
import { MoveStack } from "./move-stack";
import { isInCheck } from "./status";

export function addCastlingMoves(
  moves: MoveStack,
  board: BitBoard,
  player: i8
): void {
  const allowedOnKingSide = board.kingSideCastlingRight(player);
  const allowedOnQueenSide = board.queenSideCastlingRight(player);
  if ((!allowedOnKingSide && !allowedOnQueenSide) || isInCheck(player, board)) {
    return;
  }
  const rookMask = board.getRookMask(player);
  const allPiecesMask = board.getAllPiecesMask();
  const lane: i8 = player === WHITE ? 0 : 56;
  const queenSideRook = rookMask & (1 << lane);
  const kingSideRook = rookMask & (1 << (lane + 7));
  const isKingSidePathClear = !((allPiecesMask >> (lane + 5)) & 3);
  const isQueenSidePathClear = !((allPiecesMask >> (lane + 1)) & 7);
  if (allowedOnKingSide && kingSideRook && isKingSidePathClear) {
    board.do(encodeMove(KING + player, 4 + lane, KING + player, 5 + lane));
    if (!isInCheck(player, board)) {
      moves.push(encodeMove(KING + player, 4 + lane, KING + player, 6 + lane));
    }
    board.undo();
  }
  if (allowedOnQueenSide && queenSideRook && isQueenSidePathClear) {
    board.do(encodeMove(KING + player, 4 + lane, KING + player, 3 + lane));
    if (!isInCheck(player, board)) {
      moves.push(encodeMove(KING + player, 4 + lane, KING + player, 2 + lane));
    }
    board.undo();
  }
}
