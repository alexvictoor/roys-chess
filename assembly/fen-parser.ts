import {
  BISHOP,
  BitBoard,
  BLACK,
  CLOCK,
  EXTRA,
  KING,
  KNIGHT,
  PAWN,
  QUEEN,
  ROOK,
  WHITE,
} from "./bitboard";

const cols = ["a", "b", "c", "d", "e", "f", "g", "h"];

export function parseFEN(fen: string): BitBoard {
  const bits = new StaticArray<u64>(19);
  const board = new BitBoard(bits);
  const fenFragments = fen.split(" ");
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

  const currentPlayer = fenFragments[1] == "w" ? WHITE : BLACK;
  if (currentPlayer == BLACK) {
    board.switchPlayer();
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

  const enPassantFragment = fenFragments[3];
  if (enPassantFragment == "-") {
    board.setEnPassant(0);
  } else {
    const enPassantFile = <i8>cols.indexOf(enPassantFragment.substring(0, 1));
    board.setEnPassant((enPassantFile << 1) | 1);
  }

  const halfMoveClock = <u64>parseInt(fenFragments[4].toString(), 10);
  bits[CLOCK] = halfMoveClock;
  return board;
}
