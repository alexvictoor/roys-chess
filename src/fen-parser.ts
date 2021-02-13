import { BitBoard } from "./bitboard";
import {
  Board,
  BoardFactory,
  CastlingRights,
  PieceOnBoard,
  Player,
} from "./chess";
import { PieceListBoard } from "./piece-list-board";

export const parseFEN = (
  fen: string,
  boardFactory: BoardFactory = BitBoard.buildFromPieces
): { board: Board; player: Player } => {
  const fenFragments = fen.split(" ");
  const pieces: PieceOnBoard[] = [];
  let y = 0;
  let x = 0;
  const fenPieces = fenFragments[0];
  for (let c of fenPieces) {
    const l = c.toLowerCase();
    const player: Player = l === c ? "Black" : "White";
    switch (l) {
      case "k":
        pieces.push({
          piece: "King",
          color: player,
          position: { x, y },
        });
        break;
      case "q":
        pieces.push({
          piece: "Queen",
          color: player,
          position: { x, y },
        });
        break;
      case "b":
        pieces.push({
          piece: "Bishop",
          color: player,
          position: { x, y },
        });
        break;
      case "n":
        pieces.push({
          piece: "Knight",
          color: player,
          position: { x, y },
        });
        break;
      case "r":
        pieces.push({
          piece: "Rook",
          color: player,
          position: { x, y },
        });
        break;
      case "p":
        pieces.push({
          piece: "Pawn",
          color: player,
          position: { x, y },
        });
        break;
      case "/":
        y++;
        x = -1;
        break;
      default:
        x += parseInt(l, 10) - 1;
    }
    x++;
  }

  const castlingFragment = fenFragments[2];
  const castlingRights: CastlingRights = {
    WhiteKingSide: castlingFragment.search("K") >= 0,
    WhiteQueenSide: castlingFragment.search("Q") >= 0,
    BlackKingSide: castlingFragment.search("k") >= 0,
    BlackQueenSide: castlingFragment.search("q") >= 0,
  };
  const clock = parseInt(fenFragments[4], 10);

  //const board = new PieceListBoard(pieces, clock, castlingrights);
  //const board = BitBoard.buildFromPieces(pieces, clock, castlingrights);
  const board = boardFactory(pieces, clock, castlingRights);
  const player: Player = fenFragments[1] === "w" ? "White" : "Black";
  return {
    board,
    player,
  };
};
