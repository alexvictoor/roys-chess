import { Board, Player } from "./chess";
import { Move } from "./engine";
import { isInCheck } from "./king";

export const kingSideCastlingMoves = (
  player: Player,
  currentBoard: Board
): Move[] => {
  if (!currentBoard.kingSideCastlingRight(player)) {
    return [];
  }

  const y = player === "Black" ? 0 : 7;
  const king = currentBoard.getKing(player);
  const kingSideRook = currentBoard.getAt({ x: 7, y });

  if (
    !kingSideRook ||
    currentBoard.getAt({ x: 5, y }) ||
    currentBoard.getAt({ x: 6, y })
  ) {
    return [];
  }

  const intermediateBoard = currentBoard.move(king, { x: 5, y });

  if (isInCheck(player, intermediateBoard)) {
    return [];
  }

  const kingSideCastling = currentBoard
    .move(king, { x: 6, y })
    .move(kingSideRook, { x: 5, y });

  if (isInCheck(player, kingSideCastling)) {
    return [];
  }

  return [
    {
      pieceOnBoard: king,
      to: { x: 6, y },
      board: kingSideCastling,
    },
  ];
};

export const queenSideCastlingMoves = (
  player: Player,
  currentBoard: Board
): Move[] => {
  if (!currentBoard.queenSideCastlingRight(player)) {
    return [];
  }
  const y = player === "Black" ? 0 : 7;
  const king = currentBoard.getKing(player);
  const queenSideRook = currentBoard.getAt({ x: 0, y });

  if (
    !queenSideRook ||
    currentBoard.getAt({ x: 1, y }) ||
    currentBoard.getAt({ x: 2, y }) ||
    currentBoard.getAt({ x: 3, y })
  ) {
    return [];
  }

  const intermediateBoard = currentBoard.move(king, { x: 3, y });
  if (isInCheck(player, intermediateBoard)) {
    return [];
  }

  const queenSideCastling = currentBoard
    .move(king, { x: 2, y })
    .move(queenSideRook, { x: 3, y });

  if (isInCheck(player, queenSideCastling)) {
    return [];
  }
  return [
    {
      pieceOnBoard: king,
      to: { x: 2, y },
      board: queenSideCastling,
    },
  ];
};

export const castlingMoves = (player: Player, currentBoard: Board): Move[] => {
  if (isInCheck(player, currentBoard)) {
    return [];
  }

  const moves = kingSideCastlingMoves(player, currentBoard).concat(
    queenSideCastlingMoves(player, currentBoard)
  );
  /*if (moves.length === 1) {
    console.log("castling");
  }
  if (moves.length === 2) {
    console.log("castling");
    console.log("castling");
  }*/
  return moves;
};
