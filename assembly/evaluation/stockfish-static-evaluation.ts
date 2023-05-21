import {
  BISHOP,
  BitBoard,
  BLACK,
  MaskIterator,
  opponent,
  WHITE,
} from "../bitboard";
import { kingEg, kingMg } from "./stockfish-king";
import { mobilityFor } from "./stockfish-mobility";
import { passedEg, passedMg } from "./stockfish-passed-pawns";
import { pawnsEg, pawnsMg } from "./stockfish-pawn";
import { piecesEg, piecesMg } from "./stockfish-pieces";
import { psqtBonus } from "./stockfish-psqt";
import { space } from "./stockfish-space";
import { threatsEg, threatsMg } from "./stockfish-threats";
import { winnableTotalEg, winnableTotalMg } from "./stockfish-winnable";

export function mainEvaluation(board: BitBoard): i16 {
  const mg = middleGameEvaluation(board);
  /*var eg = end_game_evaluation(board);
    var p = phase(board), rule50 = rule50(board);
    eg = eg * scale_factor(board, eg) / 64;
    var v = (((mg * p + ((eg * (128 - p)) << 0)) / 128) << 0);
    if (arguments.length == 1) v = ((v / 16) << 0) * 16;
    v += tempo(pos);
    v = (v * (100 - rule50) / 100) << 0;
    return v;*/
  return mg;
}

function middleGameEvaluation(board: BitBoard): i16 {
  let v: i16 = 0;
  v += pieceValues(board, true);
  v += psqtBonus(board, true);
  v += imbalanceTotal(board);
  v += pawnsMg(board);
  v += piecesMg(board);
  v += mobilityFor(board, WHITE, true) - mobilityFor(board, BLACK, true);
  v += threatsMg(board);
  v += passedMg(board, WHITE) - passedMg(board, BLACK);
  v += space(board, WHITE) - space(board, BLACK);
  v += kingMg(board, WHITE) - kingMg(board, BLACK);
  v += winnableTotalMg(board, v);

  /*log(pieceValues(board, true).toString());
  log(psqtBonus(board, true).toString());
  log(imbalanceTotal(board).toString());
  log(pawnsMg(board).toString());
  log(piecesMg(board).toString());
  log(
    (
      mobilityFor(board, WHITE, true) - mobilityFor(board, BLACK, true)
    ).toString()
  );
  log(threatsMg(board).toString());
  log((passedMg(board, WHITE) - passedMg(board, BLACK)).toString());
  log((space(board, WHITE) - space(board, BLACK)).toString());
  log((kingMg(board, WHITE) - kingMg(board, BLACK)).toString());
  log(winnableTotalMg(board, v).toString());
*/
  return v;
}
export function endGameEvaluation(board: BitBoard): i16 {
  let v: i16 = 0;
  v += pieceValues(board, false);
  v += psqtBonus(board, false);
  v += imbalanceTotal(board);
  v += pawnsEg(board);
  v += piecesEg(board);
  v += mobilityFor(board, WHITE, false) - mobilityFor(board, BLACK, false);
  v += threatsEg(board);
  v += passedEg(board, WHITE) - passedEg(board, BLACK);
  v += kingEg(board, WHITE) - kingEg(board, BLACK);
  v += winnableTotalEg(board, v);

  /*log(pieceValues(board, false).toString()); // OK 4771
  log(psqtBonus(board, false).toString()); // OK -135
  log(imbalanceTotal(board).toString()); // OK 51
  log(pawnsEg(board).toString());  // OK -130
  log(piecesEg(board).toString());  // OK -54
  log(
    (
      mobilityFor(board, WHITE, false) - mobilityFor(board, BLACK, false)
    ).toString()
  ); // OK 323
  log(threatsEg(board).toString()); // OK -144
  log((passedEg(board, WHITE) - passedEg(board, BLACK)).toString()); // KO 19 vs -1
  log((kingEg(board, WHITE) - kingEg(board, BLACK)).toString()); // OK 182
  log(winnableTotalEg(board, v).toString());*/

  return v;
}



const positions = new MaskIterator();
const positions2 = new MaskIterator();
export function pieceValues(board: BitBoard, mg: boolean): i16 {
  const bonus: i16[] = mg
    ? [124, -124, 781, -781, 825, -825, 1276, -1276, 2538, -2538]
    : [206, -206, 854, -854, 915, -915, 1380, -1380, 2682, -2682];
  let result: i16 = 0;
  for (let piece = 0; piece < 10; piece++) {
    const pieceMask = unchecked(board.bits[piece]);

    result += <i16>popcnt(pieceMask) * unchecked(bonus[piece]);
  }
  return result;
}

export function imbalanceTotal(board: BitBoard): i16 {
  return (imbalance(board) + bishopPairs(board)) >> 4;
}

function bishopPairs(board: BitBoard): i16 {
  let result: i16 = 0;
  if (popcnt(board.getBishopMask(WHITE)) == 2) {
    result += 1438;
  }
  if (popcnt(board.getBishopMask(BLACK)) == 2) {
    result -= 1438;
  }
  return result;
}

function imbalance(board: BitBoard): i16 {
  //if (square == null) return sum(pos, imbalance);
  const qo: i16[][] = [
    [40, 38],
    [-40, -38],
    [32, 255, -62],
    [-32, -255, 62],
    [0, 104, 4, 0],
    [0, -104, -4, 0],
    [-26, -2, 47, 105, -208],
    [26, 2, -47, -105, 208],
    [-189, 24, 117, 133, -134, -6],
    [189, -24, -117, -133, 134, 6],
    [0],
    [0],
  ];
  const qt: i16[][] = [
    [36, 0],
    [-36, 0],
    [9, 63, 0],
    [-9, -63, 0],
    [59, 65, 42, 0],
    [-59, -65, -42, 0],
    [46, 39, 24, -24, 0],
    [-46, -39, -24, 24, 0],
    [97, 100, -42, 137, 268, 0],
    [-97, -100, 42, -137, -268, 0],
    [0],
    [0],
  ];

  const allPiecesMask = unchecked(board.getAllPiecesMask());
  let result: i16 = 0;
  for (let piece: i8 = 0; piece < 10; piece++) {
    const pieceMask = unchecked(board.bits[piece]);

    const player: i8 = piece % 2;

    positions.reset(pieceMask);
    while (positions.hasNext()) {
      positions.next();
      const bishops: i16[] = [0, 0];
      positions2.reset(allPiecesMask);
      while (positions2.hasNext()) {
        const pos = positions2.next();
        const otherPiece = board.getPieceAt(pos);
        const otherPlayer: i8 = otherPiece % 2;
        if (otherPiece === BISHOP + WHITE) {
          bishops[WHITE]++;
        } else if (otherPiece === BISHOP + BLACK) {
          bishops[BLACK]++;
        }
        if (otherPiece >> 1 > piece >> 1) {
          continue;
        }
        if (player != otherPlayer) {
          result += qt[piece][(otherPiece >> 1) + 1];
        } else {
          result += qo[piece][(otherPiece >> 1) + 1];
        }
      }
      if (bishops[player] == 2) {
        result += qo[piece][0];
      }
      if (bishops[opponent(player)] == 2) {
        result += qt[piece][0];
      }
    }
  }
  return result;
}
