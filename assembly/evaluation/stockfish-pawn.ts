import {
  BitBoard,
  BLACK,
  firstColMask,
  leftBorderMask,
  MaskIterator,
  maskString,
  opponent,
  rightBorderMask,
  toMask,
  WHITE,
} from "../bitboard";
/*
function pawnsMg(board: BitBoard, player: i8) {
  if (square == null) return sum(pos, pawns_mg);
  var v = 0;
  if (doubled_isolated(pos, square)) v -= 11;
  else if (isolated(pos, square)) v -= 5;
  else if (backward(pos, square)) v -= 9;
  v -= doubled(pos, square) * 11;
  v += connected(pos, square) ? connected_bonus(pos, square) : 0;
  v -= 13 * weak_unopposed_pawn(pos, square);
  v += [0, -11, -3][blocked(pos, square)];
  return v;
}
*/

export function doubled(board: BitBoard, player: i8, pos: i8): boolean {
  const pawnMask = board.getPawnMask(player);
  const posX: i8 = pos % 8;
  const posY: i8 = pos >> 3;
  const forwardDirection: i8 = player === WHITE ? 1 : -1;
  if (!(pawnMask & toMask(posX, posY - forwardDirection))) {
    return false;
  }
  if (pawnMask & toMask(posX - 1, posY - forwardDirection)) {
    return false;
  }
  if (pawnMask & toMask(posX + 1, posY - forwardDirection)) {
    return false;
  }
  return true;
}

export function backward(board: BitBoard, player: i8, pos: i8): boolean {
  const pawnMask = board.getPawnMask(player);
  const opponentPawnMask = board.getPawnMask(opponent(player));
  const posX: i8 = pos % 8;
  const posY: i8 = pos >> 3;
  const forwardDirection: i8 = player === WHITE ? 1 : -1;
  for (let y: i8 = posY; y < 8 && y >= 0; y -= forwardDirection) {
    if (pawnMask & toMask(posX - 1, y) || pawnMask & toMask(posX + 1, y)) {
      return false;
    }
  }
  if (
    opponentPawnMask & toMask(posX - 1, posY + forwardDirection * 2) ||
    opponentPawnMask & toMask(posX + 1, posY + forwardDirection * 2) ||
    opponentPawnMask & toMask(posX, posY + forwardDirection)
  ) {
    return true;
  }
  return false;
}

export function doubledIsolated(board: BitBoard, player: i8, pos: i8): boolean {
  if (!isolated(board, player, pos)) {
    return false;
  }
  const pawnMask = board.getPawnMask(player);
  const opponentPawnMask = board.getPawnMask(opponent(player));
  const pawnBellowMask: u64 = player === WHITE ? pawnMask : opponentPawnMask;
  const pawnUpperMask: u64 = player === WHITE ? opponentPawnMask : pawnMask;
  const posX: i8 = pos % 8;
  const posY: i8 = pos >> 3;
  let pawnBellow: boolean = false;
  let pawnUpper: boolean = false;

  for (let y: i8 = 0; y < 8; y++) {
    if (
      opponentPawnMask & ((<u64>1) << (posX - 1 + (y << 3))) ||
      opponentPawnMask & ((<u64>1) << (posX + 1 + (y << 3)))
    ) {
      return false;
    }
    if (y < posY && pawnBellowMask & ((<u64>1) << (posX + (y << 3)))) {
      pawnBellow = true;
    }
    if (y > posY && pawnUpperMask & ((<u64>1) << (posX + (y << 3)))) {
      pawnUpper = true;
    }
  }
  return pawnBellow && pawnUpper;
}

function getRowMask(row: i8): u64 {
  if (row < 0 || row > 7) {
    return 0;
  }
  return firstColMask << (<u64>row);
}

const positions = new MaskIterator();
export function isolatedAll(board: BitBoard, player: i8): boolean {
  const pawnMask = board.getPawnMask(player);
  positions.reset(pawnMask);
  while (positions.hasNext()) {
    const pos: i8 = positions.next();
    const row = pos % 8;
    const leftMask = getRowMask(row - 1);
    if (leftMask & pawnMask) {
      continue;
    }
    const rightMask = getRowMask(row + 1);
    if (rightMask & pawnMask) {
      continue;
    }
    return true;
  }
  return false;
}

export function isolated(board: BitBoard, player: i8, pos: i8): boolean {
  const pawnMask = board.getPawnMask(player);
  const row = pos % 8;
  const leftMask = getRowMask(row - 1);
  if (leftMask & pawnMask) {
    return false;
  }
  const rightMask = getRowMask(row + 1);
  if (rightMask & pawnMask) {
    return false;
  }
  return true;
}

/*export function phalanx(board: BitBoard, player: i8): i8 {
  const pawnMask = board.getPawnMask(player);
  return <i8>(
    popcnt((pawnMask >> 1) & rightBorderMask & pawnMask) +
    popcnt((pawnMask << 1) & leftBorderMask & pawnMask)
  );
}*/
export function phalanx(board: BitBoard, player: i8, pos: i8): boolean {
  const pawnMask = board.getPawnMask(player);
  const posMask = <u64>(1 << pos);
  return (
    !!((pawnMask >> 1) & rightBorderMask & posMask) ||
    !!((pawnMask << 1) & leftBorderMask & posMask)
  );
}
export function supported(board: BitBoard, player: i8, pos: i8): i8 {
  const pawnMask = board.getPawnMask(player);
  const posMask = <u64>(1 << pos);
  let result: i8 = 0;
  if (player === WHITE) {
    result += (posMask >> 7) & pawnMask & leftBorderMask ? 1 : 0;
    result += (posMask >> 9) & pawnMask & rightBorderMask ? 1 : 0;
  } else {
    result += (posMask << 7) & pawnMask & rightBorderMask ? 1 : 0;
    result += (posMask << 9) & pawnMask & leftBorderMask ? 1 : 0;
  }
  return result;
}

export function connected(board: BitBoard, player: i8, pos: i8): boolean {
  return !!(phalanx(board, player, pos) || supported(board, player, pos));
}

export function opposed(board: BitBoard, player: i8, pos: i8): boolean {
  const opponentPawnMask = board.getPawnMask(opponent(player));
  const row = pos % 8;
  if ((firstColMask << (<u64>row)) & opponentPawnMask) {
    return true;
  }
  return false;
}

export function connectedBonus(board: BitBoard, player: i8, pos: i8): i16 {
  if (!connected(board, player, pos)) {
    return 0;
  }
  const seed: i16[] = [0, 7, 8, 12, 29, 48, 86];
  //const opponentPawnMask = board.getPawnMask(opponent(player));
  //const forwardDirection: i8 = player === WHITE ? 8 : -8;
  const r: i8 = player === WHITE ? (pos >> 3) + 1 : 8 - (pos >> 3);
  const op: i16 = opposed(board, player, pos) ? 1 : 0;
  const ph: i16 = phalanx(board, player, pos) ? 1 : 0;
  const su: i16 = supported(board, player, pos);
  if (r < 2 || r > 7) {
    return 0;
  }
  return seed[r - 1] * (2 + ph - op) + 21 * su;
}

export function weakUnopposedPawn(
  board: BitBoard,
  player: i8,
  pos: i8
): boolean {
  if (opposed(board, player, pos)) {
    return false;
  }
  return isolated(board, player, pos) || backward(board, player, pos);
}

export function blocked(board: BitBoard, player: i8, pos: i8): i16 {
  const posMask = <u64>(1 << pos);
  if (player === WHITE && (pos < 32 || pos > 47)) {
    return 0;
  }
  if (player === BLACK && (pos < 16 || pos > 31)) {
    return 0;
  }
  const forwardDirection: i8 = player === WHITE ? 8 : -8;
  const opponentPawnMask = board.getPawnMask(opponent(player));
  if (!(opponentPawnMask & ((<u64>1) << (pos + forwardDirection)))) {
    return 0;
  }
  if ((player === WHITE && pos > 39) || (player === BLACK && pos < 24)) {
    return 2;
  }
  return 1;
}

const pawnsPositions = new MaskIterator();
export function pawnsMgFor(player: i8, board: BitBoard): i16 {
  const pawnMask = board.getPawnMask(player);
  const playerFactor: i16 = player === WHITE ? 1 : -1;
  pawnsPositions.reset(pawnMask);
  let result: i16 = 0;
  while (pawnsPositions.hasNext()) {
    const pos = pawnsPositions.next();
    if (doubledIsolated(board, player, pos)) {
      result -= 11;
    } else if (isolated(board, player, pos)) {
      result -= 5;
    } else if (backward(board, player, pos)) {
      result -= 9;
    }
    if (doubled(board, player, pos)) {
      result -= 11;
    }
    if (connected(board, player, pos)) {
      result += connectedBonus(board, player, pos);
    }
    if (weakUnopposedPawn(board, player, pos)) {
      result -= 13;
    }
    switch (blocked(board, player, pos)) {
      case 2:
        result -= 3;
      case 2:
        result -= 11;
      default:
        0;
    }
  }
  return result * playerFactor;
}
export function pawnsMg(board: BitBoard): i16 {
  return pawnsMgFor(WHITE, board) + pawnsMgFor(BLACK, board);
}

export function pawnAttacksSpan(board: BitBoard, player: i8, pos: i8): boolean {
  const pawnDirection: i8 = player == WHITE ? 1 : -1;
  const opponentPlayer = opponent(player);
  const pawnMask = board.getPawnMask(player);
  const opponentPawnMask = board.getPawnMask(opponentPlayer);
  let y: i8 = player == WHITE ? 7 : 0;
  const posX: i8 = pos % 8;
  const posY: i8 = pos >> 3;
  while (y != posY) {
    if (posX > 0 && (toMask(posX - 1, y) & opponentPawnMask) && ((y == posY + pawnDirection) || (!(toMask(posX - 1, y - pawnDirection) & pawnMask) && !backward(board, opponentPlayer, pos - 1))  )) {
      return true;
    }
    if (posX < 7 && (toMask(posX + 1, y) & opponentPawnMask) && ((y == posY + pawnDirection) || (!(toMask(posX + 1, y - pawnDirection) & pawnMask) && !backward(board, opponentPlayer, pos + 1))  )) {
      return true;
    }
    y -= pawnDirection;
  }
  return false;
}