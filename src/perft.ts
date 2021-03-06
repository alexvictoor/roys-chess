//import { initialBoard } from "./bitboard";
import { BitBoard, initialBoard } from "./bitboard";
import { Board, opponent, Player } from "./chess";
import { legalMoves, Move } from "./engine";
import { parseFEN } from "./fen-parser";
import {
  initialBoard as listBasedBoard,
  PieceListBoard,
} from "./piece-list-board";

const perft = (
  depth: number,
  board: Board = initialBoard,
  player: Player = "White"
) => {
  const moves = legalMoves(player, board);
  if (depth === 1 || moves.length === 0) {
    return moves.length;
  }
  return moves
    .map((m) => perft(depth - 1, m.board, opponent(player)))
    .reduce((x, y) => x + y);
};

const columns = "abcdefgh";
const encode = (move: Move) =>
  `${columns[move.pieceOnBoard.position.x]}${8 - move.pieceOnBoard.position.y}${
    columns[move.to.x]
  }${8 - move.to.y}`;

const perftx = (
  depth: number,
  board: Board = initialBoard,
  player: Player = "White"
) => {
  const moves = legalMoves(player, board);
  let nodes = 0;
  moves.forEach((m) => {
    const childNodes = perft(depth - 1, m.board, opponent(player));
    console.log(encode(m), childNodes);
    nodes += childNodes;
  });
  console.log("Nodes searched", nodes);
};

const perftDebug = (
  depth: number,
  board: Board = listBasedBoard,
  player: Player = "White"
): Move[] => {
  const moves = legalMoves(player, board);
  if (depth === 1 || moves.length === 0) {
    return moves;
  }
  return moves.flatMap((m) => perftDebug(depth - 1, m.board, opponent(player)));
};

const debugList = (depth: number) =>
  perftDebug(depth, listBasedBoard).map((m) => [
    m.board,
    legalMoves("White", m.board),
  ]);
const debugBit = (depth: number, b: Board = initialBoard) =>
  perftDebug(depth, b).map((m) => [m.board, legalMoves("White", m.board)]);

const { board: bitboard } = parseFEN(
  "r3k2r/pb3p2/5npp/n2p4/1p1PPB2/6P1/P2N1PBP/R3K2R b KQkq -",
  BitBoard.buildFromPieces
);
const { board: pieceBoard } = parseFEN(
  "r3k2r/pb3p2/5npp/n2p4/1p1PPB2/6P1/P2N1PBP/R3K2R b KQkq -",
  (pieces, clock, rights) => new PieceListBoard(pieces, clock, rights)
);

console.log(bitboard.toFEN());
const start = Date.now();
console.log("xx bitboard   perft 4", perft(4, bitboard, "Black"));
console.log("-----", Date.now() - start);
const start2 = Date.now();
console.log("xx pieceBoard perft 4", perft(4, pieceBoard, "Black"));
console.log("-----", Date.now() - start2);

/*
perftx(2, board);

console.log("---------------------");
const board2 = board.move(board.getAt({ x: 4, y: 6 }) as PieceOnBoard, {
  x: 4,
  y: 4,
});
legalMoves("Black", board2).forEach((m) => {
  console.log(encode(m));
});
*/
