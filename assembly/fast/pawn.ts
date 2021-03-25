import {
  BISHOP,
  BitBoard,
  BLACK,
  encodeCapture,
  encodeMove,
  encodePawnDoubleMove,
  getPositionsFromMask,
  KNIGHT,
  leftBorderMask,
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

export function addPawnPseudoLegalMoves(
  moves: u64[],
  board: BitBoard,
  player: i8
): void {
  const pawnMask = board.getPawnMask(player);

  const positions = getPositionsFromMask(
    oneSquareMoveMask(player, pawnMask, board.getAllPiecesMask())
  );
  const direction: i8 = player === WHITE ? 1 : -1;
  for (let i = 0; i < positions.length; i++) {
    const targetPosition = positions[i];
    const currentPosition = targetPosition - direction * 8;

    if (isInLastRow(player, positions[i])) {
      for (let j = 0; j < promotionTargets.length; j++) {
        moves.push(
          encodeMove(
            PAWN + player,
            currentPosition,
            promotionTargets[j] + player,
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

  const captureMaskOnLeft =
    pawnAttacksOnLeft(player, pawnMask) &
    board.getPlayerPiecesMask(opponent(player));
  const pawnCapturingMaskOnLeft =
    pawnAttacksOnLeft(opponent(player), captureMaskOnLeft) &
    board.getPlayerPiecesMask(player);
  const pawnCapturinLeftPositions = getPositionsFromMask(
    pawnCapturingMaskOnLeft
  );
  for (let i = 0; i < pawnCapturinLeftPositions.length; i++) {
    const capturePosition = pawnCapturinLeftPositions[i] + direction * 7;
    if (isInLastRow(player, capturePosition)) {
      for (let j = 0; j < promotionTargets.length; j++) {
        moves.push(
          encodeCapture(
            PAWN + player,
            pawnCapturinLeftPositions[i],
            promotionTargets[j] + player,
            capturePosition,
            board.getPieceAt(capturePosition)
          )
        );
      }
    } else {
      moves.push(
        encodeCapture(
          PAWN + player,
          pawnCapturinLeftPositions[i],
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
  const pawnCapturinRightPositions = getPositionsFromMask(
    pawnCapturingMaskOnRight
  );
  for (let i = 0; i < pawnCapturinRightPositions.length; i++) {
    const capturePosition = pawnCapturinRightPositions[i] + direction * 9;
    if (isInLastRow(player, capturePosition)) {
      for (let j = 0; j < promotionTargets.length; j++) {
        moves.push(
          encodeCapture(
            PAWN + player,
            pawnCapturinRightPositions[i],
            promotionTargets[j] + player,
            capturePosition,
            board.getPieceAt(capturePosition)
          )
        );
      }
    } else {
      moves.push(
        encodeCapture(
          PAWN + player,
          pawnCapturinRightPositions[i],
          PAWN + player,
          capturePosition,
          board.getPieceAt(capturePosition)
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
  const pawnsMovingTwicePositions: i8[] = getPositionsFromMask(
    pawnsMovingTwiceMask
  );
  for (let i = 0; i < pawnsMovingTwicePositions.length; i++) {
    const targetPosition = pawnsMovingTwicePositions[i];
    const currentPosition = targetPosition - direction * 16;
    moves.push(encodePawnDoubleMove(player, currentPosition, targetPosition));
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
    const pawnCapturinEnPassantLeftPositions: i8[] = getPositionsFromMask(
      pawnCapturingEnPassantMaskOnLeft
    );
    for (let i = 0; i < pawnCapturinEnPassantLeftPositions.length; i++) {
      moves.push(
        encodeCapture(
          PAWN + player,
          pawnCapturinEnPassantLeftPositions[i],
          PAWN + player,
          pawnCapturinEnPassantLeftPositions[i] + direction * 7,
          PAWN + opponent(player),
          pawnCapturinEnPassantLeftPositions[i] - direction
        )
      );
    }

    const captureEnPassantMaskOnRight =
      pawnAttacksOnRight(player, pawnMask) & enPassantMask;
    const pawnCapturingEnPassantMaskOnRight =
      pawnAttacksOnRight(opponent(player), captureEnPassantMaskOnRight) &
      board.getPlayerPiecesMask(player);
    const pawnCapturinEnPassantRightPositions: i8[] = getPositionsFromMask(
      pawnCapturingEnPassantMaskOnRight
    );
    for (let i = 0; i < pawnCapturinEnPassantRightPositions.length; i++) {
      moves.push(
        encodeCapture(
          PAWN + player,
          pawnCapturinEnPassantRightPositions[i],
          PAWN + player,
          pawnCapturinEnPassantRightPositions[i] + direction * 9,
          PAWN + opponent(player),
          pawnCapturinEnPassantRightPositions[i] + direction
        )
      );
    }
  }
}
