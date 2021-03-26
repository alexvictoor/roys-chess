import {
  BISHOP,
  BitBoard,
  BLACK,
  encodeCastling,
  encodeMove,
  KING,
  ROOK,
  WHITE,
} from "./bitboard";
import { isInCheck } from "./status";

export function addCastlingMoves(
  moves: u64[],
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
    const intermediateBoard = board.execute(
      encodeMove(KING + player, 4 + lane, KING + player, 5 + lane)
    );
    if (!isInCheck(player, intermediateBoard)) {
      moves.push(
        encodeCastling(
          KING + player,
          4 + lane,
          6 + lane,
          ROOK + player,
          7 + lane,
          5 + lane
        )
      );
    }
  }
  if (allowedOnQueenSide && queenSideRook && isQueenSidePathClear) {
    const intermediateBoard = board.execute(
      encodeMove(KING + player, 4 + lane, KING + player, 3 + lane)
    );
    if (!isInCheck(player, intermediateBoard)) {
      moves.push(
        encodeCastling(
          KING + player,
          4 + lane,
          2 + lane,
          ROOK + player,
          0 + lane,
          3 + lane
        )
      );
    }
  }
}
