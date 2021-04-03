import {
  BISHOP,
  BitBoard,
  BLACK,
  EXTRA,
  KING,
  KNIGHT,
  PAWN,
  QUEEN,
  ROOK,
  WHITE,
} from "./bitboard";

export function parseFEN(fen: string): BitBoard {
  const bits = new StaticArray<u64>(19);
  const board = new BitBoard(bits);
  const fenFragments = fen.split(" ");
  let y = 0;
  let x = 0;
  let position: i8 = 56;
  const fenPieces: string = fenFragments[0];
  for (let i: i8 = 0; i < fenPieces.length; i++) {
    const c = fenPieces.charAt(i);
    const l = c.toLowerCase();
    const player: i8 = l == c ? BLACK : WHITE;
    if (l == "p") {
      board.putPiece(PAWN, player, position);
    } else if (l == "r") {
      board.putPiece(ROOK, player, position);
    } else if (l == "n") {
      board.putPiece(KNIGHT, player, position);
    } else if (l == "b") {
      board.putPiece(BISHOP, player, position);
    } else if (l == "q") {
      board.putPiece(QUEEN, player, position);
    } else if (l == "k") {
      board.putPiece(KING, player, position);
    } else if (l == "/") {
      position = position - 17;
    } else {
      position += <i8>parseInt(l, 10) - 1;
    }
    position++;
  }

  const castlingFragment = fenFragments[2];
  const whiteKingSide = castlingFragment.indexOf("K") > -1 ? 0 : 1;
  const blackKingSide = castlingFragment.indexOf("k") > -1 ? 0 : 1;
  bits[EXTRA] = bits[EXTRA] | (whiteKingSide << 4);
  bits[EXTRA] = bits[EXTRA] | (blackKingSide << 5);
  const whiteQueenSide = castlingFragment.indexOf("Q") > -1 ? 0 : 1;
  const blackQueenSide = castlingFragment.indexOf("q") > -1 ? 0 : 1;
  bits[EXTRA] = bits[EXTRA] | (whiteQueenSide << 6);
  bits[EXTRA] = bits[EXTRA] | (blackQueenSide << 7);

  return board;
}
