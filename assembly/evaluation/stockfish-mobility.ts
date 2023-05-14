import {
  BISHOP,
  BitBoard,
  BLACK,
  firstRowMask,
  KING,
  KNIGHT,
  leftBorderMask,
  MaskIterator,
  opponent,
  PAWN,
  QUEEN,
  rightBorderMask,
  ROOK,
  WHITE,
} from "../bitboard";
import {
  bishopXRayAttackMask,
  knightAttackMask,
  queenAttackMask,
  rookXRayAttackMask,
} from "./stockfish-attacks";
import { blockersForKingMask } from "./stockfish-blocker-king";

export function mobilityAreaMask(board: BitBoard, player: i8): u64 {
  let resultMask: u64 = ~(<u64>0);
  resultMask &= ~board.getKingMask(player);
  resultMask &= ~board.getQueenMask(player);

  const allMask = board.getAllPiecesMask();
  if (player === WHITE) {
    const blockedPawnMask =
      board.getPawnMask(WHITE) &
      ((firstRowMask << 8) | (firstRowMask << 16) | (allMask >> 8));
    resultMask &= ~blockedPawnMask;
    const opponentPawnMask = board.getPawnMask(BLACK);
    const opponentPawnDefenseMask =
      ((opponentPawnMask >> 7) & leftBorderMask) |
      ((opponentPawnMask >> 9) & rightBorderMask);
    resultMask &= ~opponentPawnDefenseMask;
  } else {
    const blockedPawnMask =
      board.getPawnMask(BLACK) &
      ((firstRowMask << 40) | (firstRowMask << 48) | (allMask << 8));
    resultMask &= ~blockedPawnMask;
    const opponentPawnMask = board.getPawnMask(WHITE);
    const opponentPawnDefenseMask =
      ((opponentPawnMask << 7) & rightBorderMask) |
      ((opponentPawnMask << 9) & leftBorderMask);
    resultMask &= ~opponentPawnDefenseMask;
  }
  resultMask &= ~blockersForKingMask(board, opponent(player));
  return resultMask;
}

export function mobilityArea(
  board: BitBoard,
  player: i8,
  position: i8
): boolean {
  const positionMask = (<u64>1) << position;
  return !!(mobilityAreaMask(board, player) & positionMask);
}

export function mobility(board: BitBoard, player: i8, position: i8): i16 {
  const piece = board.getPieceAt(position);
  if (piece === PAWN + player || piece === KING + player) {
    return 0;
  }
  const mobilityMask = mobilityAreaMask(board, player);
  const queenMask = board.getQueenMask(player);
  if (piece === KNIGHT + player) {
    return <i16>(
      popcnt(
        knightAttackMask(board, player, position, mobilityMask & ~queenMask)
      )
    );
  }
  if (piece === BISHOP + player) {
    return <i16>(
      popcnt(
        bishopXRayAttackMask(board, player, position, mobilityMask & ~queenMask)
      )
    );
  }
  if (piece === ROOK + player) {
    return <i16>(
      popcnt(rookXRayAttackMask(board, player, position, mobilityMask))
    );
  }
  if (piece === QUEEN + player) {
    return <i16>popcnt(queenAttackMask(board, player, position, mobilityMask));
  }
  return 0;
}

const positions = new MaskIterator();

export function pieceMobilityBonus(
  board: BitBoard,
  player: i8,
  pieceMask: u64,
  bonus: i16[]
): i16 {
  positions.reset(pieceMask);
  let result: i16 = 0;
  while (positions.hasNext()) {
    const pos = positions.next();
    //log(player.toString() + ' ' + pos.toString() + ' ' + mobility(board, player, pos).toString() )
    result += bonus[mobility(board, player, pos)];
  }
  return result;
}
export function knightMobilityBonus(
  board: BitBoard,
  player: i8,
  mg: boolean
): i16 {
  const bonus: i16[] = mg
    ? [-62, -53, -12, -4, 3, 13, 22, 28, 33]
    : [-81, -56, -31, -16, 5, 11, 17, 20, 25];
  return pieceMobilityBonus(board, player, board.getKnightMask(player), bonus);
}
export function bishopMobilityBonus(
  board: BitBoard,
  player: i8,
  mg: boolean
): i16 {
  const bonus: i16[] = mg
    ? [-48, -20, 16, 26, 38, 51, 55, 63, 63, 68, 81, 81, 91, 98]
    : [-59, -23, -3, 13, 24, 42, 54, 57, 65, 73, 78, 86, 88, 97];
  return pieceMobilityBonus(board, player, board.getBishopMask(player), bonus);
}
export function rookMobilityBonus(
  board: BitBoard,
  player: i8,
  mg: boolean
): i16 {
  const bonus: i16[] = mg
    ? [-60, -20, 2, 3, 3, 11, 22, 31, 40, 40, 41, 48, 57, 57, 62]
    : [-78, -17, 23, 39, 70, 99, 103, 121, 134, 139, 158, 164, 168, 169, 172];
  return pieceMobilityBonus(board, player, board.getRookMask(player), bonus);
}
export function queenMobilityBonus(
  board: BitBoard,
  player: i8,
  mg: boolean
): i16 {
  const bonus: i16[] = mg
    ? [
        -30, -12, -8, -9, 20, 23, 23, 35, 38, 53, 64, 65, 65, 66, 67, 67, 72,
        72, 77, 79, 93, 108, 108, 108, 110, 114, 114, 116,
      ]
    : [
        -48, -30, -7, 19, 40, 55, 59, 75, 78, 96, 96, 100, 121, 127, 131, 133,
        136, 141, 147, 150, 151, 168, 168, 171, 182, 182, 192, 219,
      ];
  return pieceMobilityBonus(board, player, board.getQueenMask(player), bonus);
}

export function mobilityAllBoard(board: BitBoard, mg: boolean): i16 {
  const white =
    knightMobilityBonus(board, WHITE, mg) +
    bishopMobilityBonus(board, WHITE, mg) +
    rookMobilityBonus(board, WHITE, mg) +
    queenMobilityBonus(board, WHITE, mg);
  const black =
    knightMobilityBonus(board, BLACK, mg) +
    bishopMobilityBonus(board, BLACK, mg) +
    rookMobilityBonus(board, BLACK, mg) +
    queenMobilityBonus(board, BLACK, mg);
  //log('white ' + white.toString());
  return white - black;
}

export function mobilityFor(board: BitBoard, player: i8, mg: boolean): i16 {
  return (
    knightMobilityBonus(board, player, mg) +
    bishopMobilityBonus(board, player, mg) +
    rookMobilityBonus(board, player, mg) +
    queenMobilityBonus(board, player, mg)
  );
}
