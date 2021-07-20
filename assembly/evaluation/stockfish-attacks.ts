import {
  BISHOP,
  BitBoard,
  BLACK,
  KNIGHT,
  MaskIterator,
  maskString,
  opponent,
  QUEEN,
  ROOK,
  WHITE,
} from "../bitboard";
import { kingMoves } from "../king-move-generation";
import { knightMovesFromCache } from "../knight-move-generation";
import {
  pawnAttacks,
  pawnAttacksOnLeft,
  pawnAttacksOnRight,
  pawnInitialRowMask,
} from "../pawn";
import {
  bishopMoves,
  queenMoves,
  rookMoves,
} from "../sliding-pieces-move-generation";

export function bishopXRayAttackMask(
  board: BitBoard,
  player: i8,
  pos: i8,
  targetMask: u64
): u64 {
  const queensMask = board.getQueenMask(BLACK) | board.getQueenMask(WHITE);
  const boardMask = board.getAllPiecesMask() ^ queensMask;
  return bishopMoves(boardMask, pos) & targetMask;
}
export function bishopXRayAttack(
  board: BitBoard,
  player: i8,
  pos: i8,
  targetMask: u64
): boolean {
  return !!bishopXRayAttackMask(board, player, pos, targetMask);
}

export function rookXRayAttackMask(
  board: BitBoard,
  player: i8,
  pos: i8,
  targetMask: u64
): u64 {
  const queensMask = board.getQueenMask(BLACK) | board.getQueenMask(WHITE);
  const boardMask = board.getAllPiecesMask() ^ queensMask;
  return rookMoves(boardMask, pos) & targetMask;
}
export function rookXRayAttack(
  board: BitBoard,
  player: i8,
  pos: i8,
  targetMask: u64
): boolean {
  return !!rookXRayAttackMask(board, player, pos, targetMask);
}

export function queenAttackMask(
  board: BitBoard,
  player: i8,
  pos: i8,
  targetMask: u64
): u64 {
  const boardMask = board.getAllPiecesMask();
  return queenMoves(boardMask, pos) & targetMask;
}
export function queenAttack(
  board: BitBoard,
  player: i8,
  pos: i8,
  targetMask: u64
): boolean {
  const boardMask = board.getAllPiecesMask();
  return !!queenAttackMask(board, player, pos, targetMask);
}

export function knightAttackMask(
  board: BitBoard,
  player: i8,
  pos: i8,
  targetMask: u64
): u64 {
  return knightMovesFromCache(pos) & targetMask;
}
export function knightAttack(
  board: BitBoard,
  player: i8,
  pos: i8,
  targetMask: u64
): boolean {
  //const targetMask = <u64>(1 << target);
  return !!knightAttackMask(board, player, pos, targetMask);
}

const positions = new MaskIterator();

function attackByKnightsMask(board: BitBoard, player: i8): u64 {
  let resultMask: u64 = 0;
  const knightMask = board.getKnightMask(player);
  positions.reset(knightMask);
  while (positions.hasNext()) {
    const position = positions.next();
    resultMask |= knightAttackMask(board, player, position, ~0);
  }
  return resultMask;
}

function attackByBishopsMask(board: BitBoard, player: i8): u64 {
  let resultMask: u64 = 0;
  const bishopMask = board.getBishopMask(player);
  positions.reset(bishopMask);
  while (positions.hasNext()) {
    const position = positions.next();
    resultMask |= bishopXRayAttackMask(board, player, position, ~0);
  }
  return resultMask;
}

function attackByRooksMask(board: BitBoard, player: i8): u64 {
  let resultMask: u64 = 0;
  const rookMask = board.getRookMask(player);
  positions.reset(rookMask);
  while (positions.hasNext()) {
    const position = positions.next();
    resultMask |= rookXRayAttackMask(board, player, position, ~0);
  }
  return resultMask;
}
function attackByQueensMask(board: BitBoard, player: i8): u64 {
  let resultMask: u64 = 0;
  const queenMask = board.getQueenMask(player);
  positions.reset(queenMask);
  while (positions.hasNext()) {
    const position = positions.next();
    resultMask |= queenAttackMask(board, player, position, ~0);
  }
  return resultMask;
}
function attackByKingsMask(board: BitBoard, player: i8): u64 {
  let resultMask: u64 = 0;
  const kingMask = board.getKingMask(player);
  positions.reset(kingMask);
  while (positions.hasNext()) {
    const position = positions.next();
    resultMask |= kingMoves(position);
  }
  return resultMask;
}

export function attackOnceMask(board: BitBoard, player: i8): u64 {
  let resultMask: u64 = pawnAttacks(player, board.getPawnMask(player));
  resultMask |= attackByKnightsMask(board, player);
  resultMask |= attackByBishopsMask(board, player);
  resultMask |= attackByRooksMask(board, player);
  resultMask |= attackByQueensMask(board, player);
  resultMask |= attackByKingsMask(board, player);

  return resultMask;
}
export function attackTwiceMask(board: BitBoard, player: i8): u64 {
  let onceMask: u64 = pawnAttacks(player, board.getPawnMask(player));
  let twiceMask: u64 =
    pawnAttacksOnLeft(player, board.getPawnMask(player)) &
    pawnAttacksOnRight(player, board.getPawnMask(player));
  const knightMask = board.getKnightMask(player);
  positions.reset(knightMask);
  while (positions.hasNext()) {
    const position = positions.next();
    const mask = knightAttackMask(board, player, position, ~0);
    twiceMask |= onceMask & mask;
    onceMask |= mask;
  }
  const bishopMask = board.getBishopMask(player);
  positions.reset(bishopMask);
  while (positions.hasNext()) {
    const position = positions.next();
    const mask = bishopXRayAttackMask(board, player, position, ~0);
    twiceMask |= onceMask & mask;
    onceMask |= mask;
  }
  const rookMask = board.getRookMask(player);
  positions.reset(rookMask);
  while (positions.hasNext()) {
    const position = positions.next();
    const mask = rookXRayAttackMask(board, player, position, ~0);
    twiceMask |= onceMask & mask;
    onceMask |= mask;
  }
  const queenMask = board.getQueenMask(player);
  positions.reset(queenMask);
  while (positions.hasNext()) {
    const position = positions.next();
    const mask = queenAttackMask(board, player, position, ~0);
    twiceMask |= onceMask & mask;
    onceMask |= mask;
  }
  const kingMask = board.getKingMask(player);
  positions.reset(kingMask);
  while (positions.hasNext()) {
    const position = positions.next();
    const mask = kingMoves(position);
    twiceMask |= onceMask & mask;
    onceMask |= mask;
  }

  return twiceMask;
}
export function attackMask(
  board: BitBoard,
  player: i8,
  atLeastTwice: boolean
): u64 {
  return atLeastTwice
    ? attackTwiceMask(board, player)
    : attackOnceMask(board, player);
}

export function weakEnemiesMask(board: BitBoard, player: i8): u64 {
  const opponentPlayer = opponent(player);
  return (
    board.getPlayerPiecesMask(opponentPlayer) &
    attackMask(board, player, false) &
    ~pawnAttacks(opponentPlayer, board.getPawnMask(opponentPlayer))
  );
}
export function hangingMask(board: BitBoard, player: i8): u64 {
  const piecesMask = board.getPlayerPiecesMask(player);
  return (
    (piecesMask &
      attackMask(board, opponent(player), false) &
      ~attackMask(board, player, false)) |
    (piecesMask &
      attackMask(board, opponent(player), true) &
      ~board.getPawnMask(player) &
      ~pawnAttacks(player, board.getPawnMask(player)))
  );
}

export function kingThreatMask(board: BitBoard, player: i8): u64 {
  const kingMask = board.getKingMask(player);
  const kingPosition = <i8>ctz(kingMask);
  return (
    board.getPlayerPiecesMask(opponent(player)) &
    kingMoves(kingPosition) &
    ~pawnAttacks(player, board.getPawnMask(opponent(player)))
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
