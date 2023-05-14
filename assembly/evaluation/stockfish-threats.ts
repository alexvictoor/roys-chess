import {
  BitBoard, BLACK, KING, MaskIterator, maskString, opponent,
  PAWN, WHITE
} from "../bitboard";
import { kingMoves } from "../king-move-generation";
import {
  pawnAttacks, pawnInitialRowMask
} from "../pawn";
import { attackByBishopsMask, attackByKingsMask, attackByKnightsMask, attackByQueensMask, attackByRooksMask, attackMask, attackOnceMask, attackTwiceMask, bishopXRayAttackMask, knightAttackMask, rookXRayAttackMask } from "./stockfish-attacks";


export function weakEnemiesMask(board: BitBoard, player: i8): u64 {
  const opponentPlayer = opponent(player);
  return (
    board.getPlayerPiecesMask(opponentPlayer) &
    attackOnceMask(board, player) &
    ~pawnAttacks(opponentPlayer, board.getPawnMask(opponentPlayer)) &
    ~(~attackTwiceMask(board, player) & attackTwiceMask(board, opponentPlayer))
  );
}
export function hangingMask(board: BitBoard, player: i8): u64 {
  const opponentPlayer = opponent(player);
  const piecesMask = board.getPlayerPiecesMask(opponentPlayer);
  return (
    (piecesMask &
      attackMask(board, player, false) &
      ~attackMask(board, opponentPlayer, false)) |
    (piecesMask &
      attackMask(board, player, true) &
      ~board.getPawnMask(opponentPlayer) &
      ~pawnAttacks(opponentPlayer, board.getPawnMask(opponentPlayer)))
  );
}

export function kingThreatMask(board: BitBoard, player: i8): u64 {
  const kingMask = board.getKingMask(player);
  const kingPosition = <i8>ctz(kingMask);
  return (
    board.getPlayerPiecesMask(opponent(player)) &
    kingMoves(kingPosition) &
    weakEnemiesMask(board, player)
    //~pawnAttacks(player, board.getPawnMask(opponent(player)))
  );
}

export function pawnPushThreatMask(board: BitBoard, player: i8): u64 {
  const pawnMask = board.getPawnMask(player);
  const opponentPawnMask = board.getPawnMask(opponent(player));
  const allPiecesMask = board.getAllPiecesMask();
  const opponentPiecesMask = board.getPlayerPiecesMask(opponent(player));
  const initialRowMask = pawnInitialRowMask(player) & pawnMask;

  const pawnOneSquareForwardMask: u64 =
    (player === WHITE ? pawnMask << 8 : pawnMask >> 8) &
    ~allPiecesMask &
    ~pawnAttacks(opponent(player), opponentPawnMask);

  const pawnOneSquareForwardFromInitialRowMask: u64 =
    (player === WHITE ? initialRowMask << 8 : initialRowMask >> 8) &
    ~allPiecesMask;
  const pawnTwoSquaresForwardFromInitialRowMask: u64 =
    (player === WHITE
      ? pawnOneSquareForwardFromInitialRowMask << 8
      : pawnOneSquareForwardFromInitialRowMask >> 8) &
    ~allPiecesMask &
    ~pawnAttacks(opponent(player), opponentPawnMask);

  return (
    (pawnAttacks(player, pawnOneSquareForwardMask) & opponentPiecesMask) |
    (pawnAttacks(player, pawnTwoSquaresForwardFromInitialRowMask) &
      opponentPiecesMask)
  );
}

export function safePawnMask(board: BitBoard, player: i8): u64 {
  const pawnMask = board.getPawnMask(player);
  return (
    (pawnMask & attackMask(board, player, false)) |
    (pawnMask & ~attackMask(board, opponent(player), false))
  );
}

export function threatSafePawnMask(board: BitBoard, player: i8): u64 {
  const opponentPawnMask = board.getPawnMask(opponent(player));
  const opponentNonPawnPiecesMask =
    board.getPlayerPiecesMask(opponent(player)) & ~opponentPawnMask;

  return (
    pawnAttacks(player, safePawnMask(board, player)) & opponentNonPawnPiecesMask
  );
}

const positions = new MaskIterator();

export function sliderOnQueenMask(board: BitBoard, player: i8): u64 {
  const opponentPlayer = opponent(player);
  let bishopAttackMask: u64 = 0;
  let rookAttackMask: u64 = 0;
  const bishopMask = board.getBishopMask(player);
  positions.reset(bishopMask);
  while (positions.hasNext()) {
    const position = positions.next();
    bishopAttackMask |= bishopXRayAttackMask(board, player, position, ~0);
  }
  const rookMask = board.getRookMask(player);
  positions.reset(rookMask);
  while (positions.hasNext()) {
    const position = positions.next();
    rookAttackMask |= rookXRayAttackMask(board, player, position, ~0);
  }

  let opponentQueenRookLikeAttackMask: u64 = 0;
  let opponentQueenBishopLikeAttackMask: u64 = 0;
  const opponentQueenMask = board.getQueenMask(opponentPlayer);
  positions.reset(opponentQueenMask);
  while (positions.hasNext()) {
    const position = positions.next();
    opponentQueenBishopLikeAttackMask |= bishopXRayAttackMask(
      board,
      player,
      position,
      ~0
    );
    opponentQueenRookLikeAttackMask |= rookXRayAttackMask(
      board,
      player,
      position,
      ~0
    );
  }

  const attackTwiceMask = attackMask(board, player, true);
  const opponentPawnDefenseMask = pawnAttacks(
    opponentPlayer,
    board.getPawnMask(opponentPlayer)
  );

  return (
    attackTwiceMask &
    ~opponentPawnDefenseMask &
    attackByQueensMask(board, opponentPlayer) &
    ((bishopAttackMask & opponentQueenBishopLikeAttackMask) |
      (rookAttackMask & opponentQueenRookLikeAttackMask))
  );
}

export function sliderOnQueen(board: BitBoard, player: i8): i16 {
  const lostQueenFactor: i16 = popcnt(board.getQueenMask(player)) === 0 ? 2 : 1;
  return lostQueenFactor * <i16>popcnt(sliderOnQueenMask(board, player));
}

export function knightOnQueenMask(board: BitBoard, player: i8): u64 {
  const opponentPlayer = opponent(player);
  let mask: u64 = 0;

  const knightMask = board.getKnightMask(player);
  positions.reset(knightMask);
  while (positions.hasNext()) {
    const position = positions.next();
    mask |= knightAttackMask(board, player, position, ~0);
  }

  let queenDangerMask: u64 = 0;
  const opponentQueenMask = board.getQueenMask(opponentPlayer);
  positions.reset(opponentQueenMask);
  while (positions.hasNext()) {
    const position = positions.next();
    queenDangerMask |= knightAttackMask(board, player, position, ~0);
  }

  const attackTwiceMask = attackMask(board, player, true);
  const opponentPawnDefenseMask = pawnAttacks(
    opponentPlayer,
    board.getPawnMask(opponentPlayer)
  );
  const opponentAttackTwiceMask = attackMask(board, opponentPlayer, true);

  return (
    mask &
    queenDangerMask &
    ~opponentPawnDefenseMask &
    (attackTwiceMask | ~opponentAttackTwiceMask)
  );
}

export function restrictedMask(board: BitBoard, player: i8): u64 {
  const opponentPlayer = opponent(player);
  return (
    attackMask(board, player, false) &
    attackMask(board, opponentPlayer, false) &
    ~pawnAttacks(opponentPlayer, board.getPawnMask(opponentPlayer)) &
    (~attackMask(board, opponentPlayer, true) | attackMask(board, player, true))
  );
}
export function weakQueenProtectionMask(board: BitBoard, player: i8): u64 {
  const opponentPlayer = opponent(player);
  return (
    weakEnemiesMask(board, player) &
    ~attackByKnightsMask(board, opponentPlayer) &
    ~attackByBishopsMask(board, opponentPlayer) &
    ~attackByRooksMask(board, opponentPlayer) &
    ~attackByKingsMask(board, opponentPlayer) &
    attackByQueensMask(board, opponentPlayer)
  );
}

export function restricted(board: BitBoard, player: i8): i16 {
  return <i16>popcnt(restrictedMask(board, player));
}
export function weakQueenProtection(board: BitBoard, player: i8): i16 {
  return <i16>popcnt(weakQueenProtectionMask(board, player));
}

const mgMinorThreatScores = StaticArray.fromArray<i16>([
  5, 5, 57, 57, 77, 77, 88, 88, 79, 79,
]);
const egMinorThreatScores = StaticArray.fromArray<i16>([
  32, 32, 41, 41, 56, 56, 119, 119, 161, 161,
]);

export function minorThreats(board: BitBoard, player: i8, mg: boolean): i16 {
  const scores = mg ? mgMinorThreatScores : egMinorThreatScores;
  const opponentPlayer = opponent(player);
  const opponentPawnMask = board.getPawnMask(opponentPlayer);
  const opponentProtectedPieceMask =
    (opponentPawnMask |
      ~(
        pawnAttacks(opponentPlayer, opponentPawnMask) /*|
        (~attackTwiceMask(board, player) &
          attackTwiceMask(board, opponentPlayer))*/
      )) &
    ~weakEnemiesMask(board, player);
  const attackByKnights = attackByKnightsMask(board, player)
  const attackByBishops = attackByBishopsMask(board, player)
  let result: i16 = 0;
  for (let piece: i8 = PAWN; piece < KING; piece += 2) {
    const targetMask = board.bits[piece + opponentPlayer];
    const piecesAttackedByBishopsOrKnightsMask =
      (attackByKnights & targetMask) |
      (attackByBishops & targetMask);
    const minotThreatMask =
      piecesAttackedByBishopsOrKnightsMask & ~opponentProtectedPieceMask;
   
    result += <i16>popcnt(minotThreatMask) * scores[piece];
  }

  return result;
}


const mgRookThreatScores = StaticArray.fromArray<i16>([
  3, 3, 37, 37, 42, 42, 0, 0, 58, 58
]);
const egRookThreatScores = StaticArray.fromArray<i16>([
  46, 46, 68, 68, 60, 60, 38, 38, 41, 41,
]);

export function rookThreats(board: BitBoard, player: i8, mg: boolean): i16 {
  const scores = mg ? mgRookThreatScores : egRookThreatScores;
  const opponentPlayer = opponent(player);
  const weakPiecesAttacked = weakEnemiesMask(board, player) & attackByRooksMask(board, player)
  let result: i16 = 0;
  for (let piece: i8 = PAWN; piece < KING; piece += 2) {
    const targetMask = board.bits[piece + opponentPlayer];
    const rookThreatMask = targetMask & weakPiecesAttacked;
    result += <i16>popcnt(rookThreatMask) * scores[piece];
  }
  return result;
}

export function threatsMg(board: BitBoard): i16 {
  /*log(`
  WHITE
  hangingMask: ${69 * (<i16>popcnt(hangingMask(board, WHITE)))}
  kingThreatMask:  ${24 * (<i16>popcnt(kingThreatMask(board, WHITE))) }
  pawnPushThreatMask:  ${48 * (<i16>popcnt(pawnPushThreatMask(board, WHITE))) }
  threatSafePawnMask:  ${173 * (<i16>popcnt(threatSafePawnMask(board, WHITE))) }
  sliderOnQueen:  ${60 * (sliderOnQueen(board, WHITE)) }
  knightOnQueenMask  ${16 * (<i16>popcnt(knightOnQueenMask(board, WHITE))) }
  restricted  ${7 * (restricted(board, WHITE)) }
  weakQueenProtection  ${14 * (weakQueenProtection(board, WHITE)) }
  minorThreats  ${(minorThreats(board, WHITE, true)) }
  rookThreats  ${(rookThreats(board, WHITE, true))}   
  `)
  log(`
  BLACK
  hangingMask: ${69 * (<i16>popcnt(hangingMask(board, BLACK)))}
  kingThreatMask:  ${24 * (<i16>popcnt(kingThreatMask(board, BLACK))) }
  pawnPushThreatMask:  ${48 * (<i16>popcnt(pawnPushThreatMask(board, BLACK))) }
  threatSafePawnMask:  ${173 * (<i16>popcnt(threatSafePawnMask(board, BLACK))) }
  sliderOnQueen:  ${60 * (sliderOnQueen(board, BLACK)) }
  knightOnQueenMask  ${16 * (<i16>popcnt(knightOnQueenMask(board, BLACK))) }
  restricted  ${7 * (restricted(board, BLACK)) }
  weakQueenProtection  ${14 * (weakQueenProtection(board, BLACK)) }
  minorThreats  ${(minorThreats(board, BLACK, true)) }
  rookThreats  ${(rookThreats(board, BLACK, true))}   
  `)*/
  
  return (
    69 * (<i16>popcnt(hangingMask(board, WHITE)) - <i16>popcnt(hangingMask(board, BLACK))) +
    24 * (<i16>popcnt(kingThreatMask(board, WHITE)) - <i16>popcnt(kingThreatMask(board, BLACK))) +
    48 * (<i16>popcnt(pawnPushThreatMask(board, WHITE)) - <i16>popcnt(pawnPushThreatMask(board, BLACK))) +
    173 * (<i16>popcnt(threatSafePawnMask(board, WHITE)) - <i16>popcnt(threatSafePawnMask(board, BLACK))) +
    60 * (sliderOnQueen(board, WHITE) - sliderOnQueen(board, BLACK)) +
    16 * (<i16>popcnt(knightOnQueenMask(board, WHITE)) - <i16>popcnt(knightOnQueenMask(board, BLACK))) +
    7 * (restricted(board, WHITE) - restricted(board, BLACK)) +
    14 * (weakQueenProtection(board, WHITE) - weakQueenProtection(board, BLACK)) +
    (minorThreats(board, WHITE, true) - minorThreats(board, BLACK, true)) +
    (rookThreats(board, WHITE, true) - rookThreats(board, BLACK, true)) 
  ) ;
}
 