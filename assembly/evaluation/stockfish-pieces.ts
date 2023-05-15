import { backward } from "./stockfish-pawn";
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
import { parseFEN } from "../fen-parser";
import { knightMovesFromCache } from "../knight-move-generation";
import {
  bishopMoves,
  queenMoves,
  rookMoves,
} from "../sliding-pieces-move-generation";
import {
  bishopXRayAttack,
  bishopXRayAttackMask,
  knightAttack,
} from "./stockfish-attacks";
import { mobility } from "./stockfish-mobility";
import { bishopsOnKingRing, rooksOnKingRing } from "./stockfish-king";

export function pawnAttacksSpan(board: BitBoard, player: i8, pos: i8): i16 {
  const pawnMask = board.getPawnMask(player);
  const opponentPawnMask = board.getPawnMask(opponent(player));
  const posX: i8 = pos % 8;
  const posY: i8 = pos >> 3;
  const forwardDirection: i8 = player === WHITE ? 1 : -1;
  const lastRow: i8 = player === WHITE ? 7 : 0;
  for (let y: i8 = lastRow; y != posY; y -= forwardDirection) {
    if (
      posX > 0 &&
      toMask(posX - 1, y) & opponentPawnMask &&
      (y == posY + forwardDirection ||
        (!(toMask(posX - 1, y - forwardDirection) & pawnMask) &&
          !backward(board, opponent(player), ((7 - y) << 3) + posX - 1)))
    ) {
      return <i16>1;
    }
    if (
      posX < 7 &&
      toMask(posX + 1, y) & opponentPawnMask &&
      (y == posY + forwardDirection ||
        (!(toMask(posX + 1, y - forwardDirection) & pawnMask) &&
          !backward(board, opponent(player), ((7 - y) << 3) + posX + 1)))
    ) {
      return <i16>1;
    }
  }
  return <i16>0;
}

export function outpostSquare(board: BitBoard, player: i8, pos: i8): i16 {
  const posX: i8 = pos % 8;
  const posY: i8 = pos >> 3;
  const pawnMask = board.getPawnMask(player);
  const forwardDirection: i8 = player === WHITE ? 1 : -1;

  if (player === WHITE && (posY < 3 || posY > 5)) {
    return 0;
  }
  if (player === BLACK && (posY < 2 || posY > 4)) {
    return 0;
  }
  if (
    !(toMask(posX - 1, posY - forwardDirection) & pawnMask) &&
    !(toMask(posX + 1, posY - forwardDirection) & pawnMask)
  ) {
    return 0;
  }
  if (pawnAttacksSpan(board, player, pos)) {
    return 0;
  }
  return 1;
}
export function outpost(board: BitBoard, player: i8, pos: i8): i16 {
  const posMask = <u64>(1 << pos);
  const bishopMask = board.getBishopMask(player);
  const knightMask = board.getKnightMask(player);

  if (
    posMask & (bishopMask | knightMask) &&
    outpostSquare(board, player, pos)
  ) {
    return 1;
  }

  return 0;
}

export function reachableOutpost(board: BitBoard, player: i8, pos: i8): i16 {
  const posMask = <u64>(1 << pos);
  const pawnMask = board.getPawnMask(player);
  const bishopMask = board.getBishopMask(player);
  const knightMask = board.getKnightMask(player);

  if (!(posMask & (bishopMask | knightMask))) {
    return 0;
  }

  const playerMask = board.getPlayerPiecesMask(player);
  let result: i16 = 0;
  for (let targetPos: i8 = 16; targetPos < 48; targetPos++) {
    const targetMask = <u64>(1 << targetPos);
    if (!(playerMask & targetMask) && outpostSquare(board, player, targetPos)) {
      if (
        (!!(posMask & knightMask) &&
          knightAttack(board, player, pos, targetMask)) ||
        (!!(posMask & bishopMask) &&
          bishopXRayAttack(board, player, pos, targetMask))
      ) {
        if (player === WHITE) {
          if (
            (targetMask >> 7) & pawnMask & leftBorderMask ||
            (targetMask >> 9) & pawnMask & rightBorderMask
          ) {
            return 2;
          }
          result = 1;
        } else {
          if (
            (targetMask << 7) & pawnMask & rightBorderMask ||
            (targetMask << 9) & pawnMask & leftBorderMask
          ) {
            return 2;
          }
          result = 1;
        }
      }
    }
  }

  return result;
}

const positions = new MaskIterator();
const mgScores = StaticArray.fromArray<i16>([0, 31, -7, 30, 56]);
const egScores = StaticArray.fromArray<i16>([0, 22, 36, 23, 36]);

export function outpostTotal(board: BitBoard, player: i8, mg: boolean): i16 {
  const scores = mg ? mgScores : egScores;
  let result: i16 = 0;
  const bishopMask = board.getBishopMask(player);
  const knightMask = board.getKnightMask(player);
  const opponentMask = board.getPlayerPiecesMask(opponent(player));
  positions.reset(bishopMask);
  while (positions.hasNext()) {
    const pos = positions.next();
    if (outpost(board, player, pos)) {
      result += scores[3];
    }
  }
  positions.reset(knightMask);
  while (positions.hasNext()) {
    const pos = positions.next();
    if (outpost(board, player, pos)) {
      const posX: i8 = pos % 8;
      const posY: i8 = pos >> 3;
      const posMask = <u64>(1 << pos);
      if (posX < 2 || posX > 5) {
        let ea: boolean = false;
        let cnt: i8 = 0;
        for (let x: i8 = 0; x < 8; x++) {
          for (let y: i8 = 0; y < 8; y++) {
            if (
              ((Math.abs(posX - x) == 2 && Math.abs(posY - y) == 1) ||
                (Math.abs(posX - x) == 1 && Math.abs(posY - y) == 2)) &&
              opponentMask & posMask
            ) {
              ea = true;
            }
            if (
              ((x < 4 && posX < 4) || (x >= 4 && posX >= 4)) &&
              opponentMask & posMask
            ) {
              cnt++;
            }
          }
        }
        if (!ea && cnt <= 1) {
          result -= scores[2];
        }
      }

      result += scores[4];
    } else if (!!reachableOutpost(board, player, pos)) {
      result += scores[1];
    }
  }
  return result;
}

export function countMinorBehindPawn(board: BitBoard, player: i8): i16 {
  const minorMask = board.getBishopMask(player) | board.getKnightMask(player);
  const pawnMask = board.getPawnMask(player);
  const behindPawnMask = player === WHITE ? pawnMask >> 8 : pawnMask << 8;
  return <i16>popcnt(behindPawnMask & minorMask);
}

export function buildCheckerMask(): u64 {
  let result: u64 = 0;
  for (let i: i8 = 0; i < 8; i++) {
    const offset = (i & 1) + (i << 3);
    for (let j: i8 = offset; j < offset + 8; j = j + 2) {
      result += (<u64>1) << j;
    }
  }
  return result;
}
const checkerMask: u64 = buildCheckerMask();

const centerFilesMask: u64 =
  (firstColMask << 2) |
  (firstColMask << 3) |
  (firstColMask << 4) |
  (firstColMask << 5);

export function countBishopPawns(board: BitBoard, player: i8): i16 {
  const bishopMask = board.getBishopMask(player);
  const pawnMask = board.getPawnMask(player);
  const allPiecesMask = board.getAllPiecesMask();
  const blockerMask =
    player === WHITE ? allPiecesMask >> 8 : allPiecesMask << 8;
  let result: i16 = 0;
  const firstBishop = bishopMask & checkerMask;
  if (firstBishop) {
    result += <i16>popcnt(pawnMask & checkerMask);
  }
  const secondBishop = bishopMask & ~checkerMask;
  if (secondBishop) {
    result += <i16>popcnt(pawnMask & ~checkerMask);
  }
  const blockedPawnsOnCenterFiles =  <i16>popcnt(pawnMask & centerFilesMask & blockerMask);
  return result * (1 + blockedPawnsOnCenterFiles);
}

export function countBishopXrayPawns(board: BitBoard, player: i8): i16 {
  const bishopMask = board.getBishopMask(player);
  const opponentPawnMask = board.getPawnMask(opponent(player));
  let result: i16 = <i16>0;
  positions.reset(bishopMask);
  while (positions.hasNext()) {
    const pos = positions.next();
    result += <i16>popcnt(bishopMoves(0, pos) & opponentPawnMask);
  }
  return result;
}

export function countRooksOnQueenFiles(board: BitBoard, player: i8): i16 {
  const rookMask = board.getRookMask(player);
  const queenMask = board.getQueenMask(WHITE) | board.getQueenMask(BLACK);
  let result: i16 = <i16>0;
  positions.reset(rookMask);
  while (positions.hasNext()) {
    const pos = positions.next();
    const rookFile = pos % 8;
    if ((firstColMask << rookFile) & queenMask) {
      result++;
    }
  }
  return result;
}

export function rookOnFile(board: BitBoard, player: i8, pos: i8): i16 {
  const pawnMask = board.getPawnMask(player);
  const opponentPawnMask = board.getPawnMask(opponent(player));
  const rookFile = pos % 8;
  const rookFileMask = firstColMask << rookFile;
  if (rookFileMask & pawnMask) {
    return 0;
  }
  if (rookFileMask & opponentPawnMask) {
    return 1;
  }
  return 2;
}

const mgRooksOnFileScores = StaticArray.fromArray<i16>([0, 19, 48]);
const egRooksOnFileScores = StaticArray.fromArray<i16>([0, 7, 29]);

export function rooksOnFile(board: BitBoard, player: i8, mg: boolean): i16 {
  const scores = mg ? mgRooksOnFileScores : egRooksOnFileScores;
  const rookMask = board.getRookMask(player);
  const pawnMask = board.getPawnMask(player);
  const opponentPawnMask = board.getPawnMask(opponent(player));
  positions.reset(rookMask);
  let result: i16 = 0;
  while (positions.hasNext()) {
    const pos = positions.next();
    const rookFile = pos % 8;
    const rookFileMask = firstColMask << rookFile;
    if (rookFileMask & pawnMask) {
      continue;
    }
    if (rookFileMask & opponentPawnMask) {
      result += scores[1];
    } else {
      result += scores[2];
    }
  }
  return result;
}

export function trappedRooks(board: BitBoard, player: i8, pos: i8): i16 {
  if (rookOnFile(board, player, pos) || mobility(board, player, pos) > 3) {
    return 0;
  }
  const kingPos = <i8>ctz(board.getKingMask(player));
  const kingPosX = kingPos % 8;
  const posX = pos % 8;
  if (kingPosX < 4 !== posX < kingPosX) {  // <4 as https://groups.google.com/g/fishcooking/c/kHs9Ajva_lQ?pli=1 ?
    return 0;
  }
  return 1;
}

const bishopPositions = new MaskIterator();
const rookPositions = new MaskIterator();

export function countTrappedRooks(board: BitBoard, player: i8): i16 {
  rookPositions.reset(board.getRookMask(player));
  let result: i16 = 0;
  while (rookPositions.hasNext()) {
    const pos = rookPositions.next();
    result += trappedRooks(board, player, pos);
  }
  return result;
}

export function weakQueen(board: BitBoard, player: i8): i16 {
  const boardMask = board.getAllPiecesMask();
  const queenMask = board.getQueenMask(player);
  const opponentPlayer = opponent(player);
  const opponentBishopMask = board.getBishopMask(opponentPlayer);
  const opponentRookMask = board.getRookMask(opponentPlayer);
  positions.reset(queenMask);
  let result: i16 = 0;
  while (positions.hasNext()) {
    const queenPosition = positions.next();
    const queenMoveMask = queenMoves(boardMask, queenPosition);
    bishopPositions.reset(opponentBishopMask);
    while (bishopPositions.hasNext()) {
      const bishopPosition = bishopPositions.next();
      if (
        bishopMoves(0, bishopPosition) & ((<u64>1) << queenPosition) &&
        popcnt(bishopMoves(boardMask, bishopPosition) & queenMoveMask) == 1
      ) {
        result += 1;
      }
    }
    rookPositions.reset(opponentRookMask);
    while (rookPositions.hasNext()) {
      const rookPosition = rookPositions.next();
      if (
        rookMoves(0, rookPosition) & ((<u64>1) << queenPosition) &&
        popcnt(rookMoves(boardMask, rookPosition) & queenMoveMask) == 1
      ) {
        result += 1;
      }
    }
  }
  return result;
}

export function queenInfiltration(board: BitBoard, player: i8): i16 {
  const queenMask = board.getQueenMask(player);
  const opponentPlayer = opponent(player);
  const opponentPawnMask = board.getPawnMask(opponentPlayer);
  const pawnDirection: i8 = player == WHITE ? 1 : -1;
  positions.reset(queenMask);
  let result: i16 = 0;
  while (positions.hasNext()) {
    const queenPosition = positions.next();
    const posX: i8 = queenPosition % 8;
    const posY: i8 = queenPosition >> 3;
    if ((player === WHITE && posY < 4) || (player === BLACK && posY > 3)) {
      continue;
    }
    if (posX > 0 && toMask(posX - 1, posY + pawnDirection) & opponentPawnMask) {
      continue;
    }
    if (posX < 7 && toMask(posX + 1, posY + pawnDirection) & opponentPawnMask) {
      continue;
    }
    if (pawnAttacksSpan(board, player, queenPosition)) {
      continue;
    }
    result++;
  }
  return result;
}

export function kingDistance(board: BitBoard, player: i8, position: i8): i16 {
  const kingMask = board.getKingMask(player);
  const kingPosition = <i8>ctz(kingMask);
  const posX: i8 = position % 8;
  const posY: i8 = position >> 3;
  const kingPosX: i8 = kingPosition % 8;
  const kingPosY: i8 = kingPosition >> 3;
  return <i16>Math.max(Math.abs(posX - kingPosX), Math.abs(posY - kingPosY));
}

export function kingProtectorMg(board: BitBoard, player: i8): i16 {
  let result: i16 = 0;
  positions.reset(board.getKnightMask(player));
  while (positions.hasNext()) {
    const knightPos = positions.next();
    result += 8 * kingDistance(board, player, knightPos);
  }
  positions.reset(board.getBishopMask(player));
  while (positions.hasNext()) {
    const bishopPos = positions.next();
    result += 6 * kingDistance(board, player, bishopPos);
  }
  return result;
}

export function kingProtectorEg(board: BitBoard, player: i8): i16 {
  let result: i16 = 0;
  positions.reset(board.getKnightMask(player) | board.getBishopMask(player));
  while (positions.hasNext()) {
    const knightPos = positions.next();
    result += 9 * kingDistance(board, player, knightPos);
  }
  return result;
}

const centerMask: u64 = (1 << 27) | (1 << 28) | (1 << 35) | (1 << 36);

export function longDiagonalBishop(
  board: BitBoard,
  player: i8
): i16 {
  const bishopMask = board.getBishopMask(player);
  const pawnMask = board.getPawnMask(WHITE) | board.getPawnMask(BLACK);
  positions.reset(bishopMask);
  let result: i16 = 0;
  while(positions.hasNext()) {
    const position = positions.next();
    const movesMask = bishopMoves(pawnMask, position);
    if (popcnt(centerMask & movesMask) == 2) {
      result++;
    }
  }
 return result;
}

function trappedRooksBonus(board: BitBoard, player: i8): i16 {
  return (
    countTrappedRooks(board, player) *
    (board.kingSideCastlingRight(player) || board.queenSideCastlingRight(player)
      ? 1
      : 2)
  );
}

export function piecesMg(board: BitBoard): i16 {
  let v: i16 = 0;
  v += outpostTotal(board, WHITE, true) - outpostTotal(board, BLACK, true);
  v +=
    18 *
    (countMinorBehindPawn(board, WHITE) - countMinorBehindPawn(board, BLACK));
  v -= 3 * (countBishopPawns(board, WHITE) - countBishopPawns(board, BLACK));
  v -=
    4 *
    (countBishopXrayPawns(board, WHITE) - countBishopXrayPawns(board, BLACK));
  v +=
    6 *
    (countRooksOnQueenFiles(board, WHITE) -
      countRooksOnQueenFiles(board, BLACK));
  v += 16 * (rooksOnKingRing(board, WHITE) - rooksOnKingRing(board, BLACK));
  v += 24 * (bishopsOnKingRing(board, WHITE) - bishopsOnKingRing(board, BLACK));
  v += rooksOnFile(board, WHITE, true) - rooksOnFile(board, BLACK, true);
  v -= 55 * (trappedRooksBonus(board, WHITE) - trappedRooksBonus(board, BLACK));
  v -= 56 * (weakQueen(board, WHITE) - weakQueen(board, BLACK));
  v -= 2 * (queenInfiltration(board, WHITE) - queenInfiltration(board, BLACK));
  v -= kingProtectorMg(board, WHITE) - kingProtectorMg(board, BLACK);
  v += 45 * (longDiagonalBishop(board, WHITE) - longDiagonalBishop(board, BLACK));

  return v;
}

export function piecesEg(board: BitBoard): i16 {
  let v: i16 = 0;
  v += outpostTotal(board, WHITE, false) - outpostTotal(board, BLACK, false);
  v +=
    3 *
    (countMinorBehindPawn(board, WHITE) - countMinorBehindPawn(board, BLACK));
  v -= 7 * (countBishopPawns(board, WHITE) - countBishopPawns(board, BLACK));
  v -=
    5 *
    (countBishopXrayPawns(board, WHITE) - countBishopXrayPawns(board, BLACK));
  v +=
    11 *
    (countRooksOnQueenFiles(board, WHITE) -
      countRooksOnQueenFiles(board, BLACK));
  //v += 16 * (rooksOnKingRing(board, WHITE) - rooksOnKingRing(board, BLACK));
  //v += 24 * (bishopsOnKingRing(board, WHITE) - bishopsOnKingRing(board, BLACK));
  v += rooksOnFile(board, WHITE, false) - rooksOnFile(board, BLACK, false);
  v -= 13 * (trappedRooksBonus(board, WHITE) - trappedRooksBonus(board, BLACK));
  v -= 15 * (weakQueen(board, WHITE) - weakQueen(board, BLACK));
  v += 14 * (queenInfiltration(board, WHITE) - queenInfiltration(board, BLACK));
  v -= kingProtectorEg(board, WHITE) - kingProtectorEg(board, BLACK);
  //v += 45 * (longDiagonalBishop(board, WHITE) - longDiagonalBishop(board, BLACK));

  return v;
}
