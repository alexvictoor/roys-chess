import {
  BISHOP,
  BitBoard,
  BLACK,
  encodeCapture,
  encodeMove,
  encodePawnDoubleMove,
  KNIGHT,
  leftBorderMask,
  MaskIterator,
  opponent,
  PAWN,
  QUEEN,
  rightBorderMask,
  ROOK,
  WHITE,
} from "./bitboard";

const whiteInitialRowMask: u64 =
  (1 << 8) |
  (1 << 9) |
  (1 << 10) |
  (1 << 11) |
  (1 << 12) |
  (1 << 13) |
  (1 << 14) |
  (1 << 15);

const blackInitialRowMask: u64 =
  (1 << 48) |
  (1 << 49) |
  (1 << 50) |
  (1 << 51) |
  (1 << 52) |
  (1 << 53) |
  (1 << 54) |
  (1 << 55);

export function pawnInitialRowMask(player: i8): u64 {
  return player === WHITE ? whiteInitialRowMask : blackInitialRowMask;
}

export function pawnAttacksOnLeft(player: i8, pawnMask: u64): u64 {
  return player === BLACK
    ? (pawnMask >> 7) & leftBorderMask
    : (pawnMask << 7) & rightBorderMask;
}

export function pawnAttacksOnRight(player: i8, pawnMask: u64): u64 {
  return player === BLACK
    ? (pawnMask >> 9) & rightBorderMask
    : (pawnMask << 9) & leftBorderMask;
}
export function pawnAttacks(player: i8, pawnMask: u64): u64 {
  return player === BLACK
    ? ((pawnMask >> 7) & leftBorderMask) | ((pawnMask >> 9) & rightBorderMask)
    : ((pawnMask << 7) & rightBorderMask) | ((pawnMask << 9) & leftBorderMask);
}

const isInLastRow = (player: i8, position: i8): boolean =>
  player === WHITE ? position > 55 : position < 8;

const oneSquareMoveMask = (player: i8, pawnMask: u64, allMask: u64): u64 =>
  player === WHITE ? (pawnMask << 8) & ~allMask : (pawnMask >> 8) & ~allMask;

const promotionTargets: i8[] = [QUEEN, ROOK, BISHOP, KNIGHT];

const positions = new MaskIterator();
const pawnCapturinLeftPositions = new MaskIterator();
const pawnCapturinRightPositions = new MaskIterator();
const pawnsMovingTwicePositions = new MaskIterator();
const pawnCapturinEnPassantLeftPositions = new MaskIterator();
const pawnCapturinEnPassantRightPositions = new MaskIterator();

export function addPawnPseudoLegalMoves(
  moves: u32[],
  board: BitBoard,
  player: i8
): void {
  addPawnPseudoLegalCaptures(moves, board, player);

  const pawnMask = board.getPawnMask(player);

  positions.reset(
    oneSquareMoveMask(player, pawnMask, board.getAllPiecesMask())
  );
  const direction: i8 = player === WHITE ? 1 : -1;
  while (positions.hasNext()) {
    const targetPosition = positions.next();
    const currentPosition = targetPosition - direction * 8;

    if (isInLastRow(player, targetPosition)) {
      for (let j = 0; j < promotionTargets.length; j++) {
        moves.push(
          encodeMove(
            PAWN + player,
            currentPosition,
            unchecked(promotionTargets[j]) + player,
            targetPosition
          )
        );
      }
    } else {
      moves.push(
        encodeMove(
          PAWN + player,
          currentPosition,
          PAWN + player,
          targetPosition
        )
      );
    }
  }

  const pawnsOnInitialRowMask = pawnMask & pawnInitialRowMask(player);
  const pawnsMovingTwiceMask = oneSquareMoveMask(
    player,
    oneSquareMoveMask(player, pawnsOnInitialRowMask, board.getAllPiecesMask()),
    board.getAllPiecesMask()
  );
  pawnsMovingTwicePositions.reset(pawnsMovingTwiceMask);
  while (pawnsMovingTwicePositions.hasNext()) {
    const targetPosition = pawnsMovingTwicePositions.next();
    const currentPosition = targetPosition - direction * 16;
    moves.push(encodePawnDoubleMove(player, currentPosition, targetPosition));
  }
}

export function addPawnPseudoLegalCaptures(
  moves: u32[],
  board: BitBoard,
  player: i8
): void {
  const pawnMask = board.getPawnMask(player);

  const direction: i8 = player === WHITE ? 1 : -1;
  const opponentPlayer = opponent(player);

  const captureMaskOnLeft =
    pawnAttacksOnLeft(player, pawnMask) &
    board.getPlayerPiecesMask(opponentPlayer);
  const pawnCapturingMaskOnLeft =
    pawnAttacksOnLeft(opponent(player), captureMaskOnLeft) &
    board.getPlayerPiecesMask(player);
  pawnCapturinLeftPositions.reset(pawnCapturingMaskOnLeft);
  while (pawnCapturinLeftPositions.hasNext()) {
    const pawnCapturinLeftPosition = pawnCapturinLeftPositions.next();
    const capturePosition = pawnCapturinLeftPosition + direction * 7;
    if (isInLastRow(player, capturePosition)) {
      for (let j = 0; j < promotionTargets.length; j++) {
        moves.push(
          encodeCapture(
            PAWN + player,
            pawnCapturinLeftPosition,
            unchecked(promotionTargets[j]) + player,
            capturePosition,
            board.getPieceAt(capturePosition)
          )
        );
      }
    } else {
      moves.push(
        encodeCapture(
          PAWN + player,
          pawnCapturinLeftPosition,
          PAWN + player,
          capturePosition,
          board.getPieceAt(capturePosition)
        )
      );
    }
  }
  const captureMaskOnRight =
    pawnAttacksOnRight(player, pawnMask) &
    board.getPlayerPiecesMask(opponent(player));
  const pawnCapturingMaskOnRight =
    pawnAttacksOnRight(opponent(player), captureMaskOnRight) &
    board.getPlayerPiecesMask(player);
  pawnCapturinRightPositions.reset(pawnCapturingMaskOnRight);
  while (pawnCapturinRightPositions.hasNext()) {
    const pawnCapturinRightPosition = pawnCapturinRightPositions.next();
    const capturePosition = pawnCapturinRightPosition + direction * 9;
    if (isInLastRow(player, capturePosition)) {
      for (let j = 0; j < promotionTargets.length; j++) {
        moves.push(
          encodeCapture(
            PAWN + player,
            pawnCapturinRightPosition,
            unchecked(promotionTargets[j]) + player,
            capturePosition,
            board.getPieceAt(capturePosition)
          )
        );
      }
    } else {
      moves.push(
        encodeCapture(
          PAWN + player,
          pawnCapturinRightPosition,
          PAWN + player,
          capturePosition,
          board.getPieceAt(capturePosition)
        )
      );
    }
  }

  const enPassantFile = board.getEnPassantFile();

  if (enPassantFile >= 0) {
    const enPassantMask: u64 =
      player === BLACK ? 1 << (16 + enPassantFile) : 1 << (40 + enPassantFile);
    const captureEnPassantMaskOnLeft =
      pawnAttacksOnLeft(player, pawnMask) & enPassantMask;
    const pawnCapturingEnPassantMaskOnLeft =
      pawnAttacksOnLeft(opponent(player), captureEnPassantMaskOnLeft) &
      board.getPlayerPiecesMask(player);
    pawnCapturinEnPassantLeftPositions.reset(pawnCapturingEnPassantMaskOnLeft);
    while (pawnCapturinEnPassantLeftPositions.hasNext()) {
      const pawnCapturinEnPassantLeftPosition = pawnCapturinEnPassantLeftPositions.next();
      moves.push(
        encodeCapture(
          PAWN + player,
          pawnCapturinEnPassantLeftPosition,
          PAWN + player,
          pawnCapturinEnPassantLeftPosition + direction * 7,
          PAWN + opponent(player),
          pawnCapturinEnPassantLeftPosition - direction
        )
      );
    }

    const captureEnPassantMaskOnRight =
      pawnAttacksOnRight(player, pawnMask) & enPassantMask;
    const pawnCapturingEnPassantMaskOnRight =
      pawnAttacksOnRight(opponent(player), captureEnPassantMaskOnRight) &
      board.getPlayerPiecesMask(player);
    pawnCapturinEnPassantRightPositions.reset(
      pawnCapturingEnPassantMaskOnRight
    );
    while (pawnCapturinEnPassantRightPositions.hasNext()) {
      const pawnCapturinEnPassantRightPosition = pawnCapturinEnPassantRightPositions.next();
      moves.push(
        encodeCapture(
          PAWN + player,
          pawnCapturinEnPassantRightPosition,
          PAWN + player,
          pawnCapturinEnPassantRightPosition + direction * 9,
          PAWN + opponent(player),
          pawnCapturinEnPassantRightPosition + direction
        )
      );
    }
  }
}
