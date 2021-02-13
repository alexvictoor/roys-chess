//import { initialBoard } from "./bitboard";
import { PieceOnBoard } from "./chess";
import { parseFEN } from "./fen-parser";
import { isInCheck } from "./king";

const { board } = parseFEN(
  "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -"
);
const whiteKing = board.getAt({ x: 4, y: 7 });
console.log(whiteKing);
const board2 = board.move(whiteKing as PieceOnBoard, { x: 5, y: 7 });
const blackBishop = board2.getAt({ x: 0, y: 2 });
console.log(blackBishop);
const board3 = board2.move(blackBishop as PieceOnBoard, { x: 4, y: 6 });

console.log("checks " + isInCheck("White", board3));
