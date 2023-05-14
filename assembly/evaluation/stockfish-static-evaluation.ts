import {
  BISHOP,
  BitBoard,
  BLACK,
  MaskIterator,
  opponent,
  WHITE,
} from "../bitboard";
import { kingMg } from "./stockfish-king";
import { mobilityFor } from "./stockfish-mobility";
import { passedMg } from "./stockfish-passed-pawns";
import { pawnsMg } from "./stockfish-pawn";
import { piecesMg } from "./stockfish-pieces";
import { space } from "./stockfish-space";
import { threatsMg } from "./stockfish-threats";
import { winnableTotalMg } from "./stockfish-winnable";

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
  v += mobilityFor(board, WHITE, true) - mobilityFor(board, BLACK, true)
  v += threatsMg(board);
  v += passedMg(board, WHITE) - passedMg(board, BLACK);
  v += space(board, WHITE) - space(board, BLACK);
  v += kingMg(board, WHITE) - kingMg(board, BLACK);
  v += winnableTotalMg(board, v);

  log(( pieceValues(board, true)).toString());
  log(( psqtBonus(board, true)).toString());
  log(( imbalanceTotal(board)).toString());
  log(( pawnsMg(board)).toString());
  log(( piecesMg(board)).toString());
  log(( mobilityFor(board, WHITE, true) - mobilityFor(board, BLACK, true)).toString());
  log(( threatsMg(board)).toString());
  log(( passedMg(board, WHITE) - passedMg(board, BLACK)).toString());
  log(( space(board, WHITE) - space(board, BLACK)).toString());
  log(( kingMg(board, WHITE) - kingMg(board, BLACK)).toString());
  log(( winnableTotalMg(board, v)).toString());
  /*
{
  "piece_value_mg": 905,
  "psqt_mg": -193,
  "imbalance_total": 201,
  "pawns_mg": -24,
  "pieces_mg": 27,
  "mobility_mg": 51,
  "threats_mg": -150,
  "passed_mg": 0,
  "space": 119,
  "king_mg": 8
}

  */
  return v;
}

/*
function piece_value_mg(pos, square) {
    if (square == null) return sum(pos, piece_value_mg);
    return piece_value_bonus(pos, square, true);
  }*/

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

const mgBonus: i16[][] = [
  [
    -175, -92, -74, -73, -73, -74, -92, -175, -77, -41, -27, -15, -15, -27, -41,
    -77, -61, -17, 6, 12, 12, 6, -17, -61, -35, 8, 40, 49, 49, 40, 8, -35, -34,
    13, 44, 51, 51, 44, 13, -34, -9, 22, 58, 53, 53, 58, 22, -9, -67, -27, 4,
    37, 37, 4, -27, -67, -201, -83, -56, -26, -26, -56, -83, -201,
  ],
  [
    201, 83, 56, 26, 26, 56, 83, 201, 67, 27, -4, -37, -37, -4, 27, 67, 9, -22,
    -58, -53, -53, -58, -22, 9, 34, -13, -44, -51, -51, -44, -13, 34, 35, -8,
    -40, -49, -49, -40, -8, 35, 61, 17, -6, -12, -12, -6, 17, 61, 77, 41, 27,
    15, 15, 27, 41, 77, 175, 92, 74, 73, 73, 74, 92, 175,
  ],

  [
    -23, -8, -5, -53, -53, -5, -8, -23, 4, 19, 8, -15, -15, 8, 19, 4, 17, -5,
    21, -7, -7, 21, -5, 17, 39, 25, 11, -5, -5, 11, 25, 39, 31, 22, 29, -12,
    -12, 29, 22, 31, 11, 1, 6, -16, -16, 6, 1, 11, 0, 5, -14, -17, -17, -14, 5,
    0, -23, -14, 1, -48, -48, 1, -14, -23,
  ],
  [
    23, 14, -1, 48, 48, -1, 14, 23, 0, -5, 14, 17, 17, 14, -5, 0, -11, -1, -6,
    16, 16, -6, -1, -11, -31, -22, -29, 12, 12, -29, -22, -31, -39, -25, -11, 5,
    5, -11, -25, -39, -17, 5, -21, 7, 7, -21, 5, -17, -4, -19, -8, 15, 15, -8,
    -19, -4, 23, 8, 5, 53, 53, 5, 8, 23,
  ],

  [
    -5, -14, -20, -31, -31, -20, -14, -5, 6, -8, -13, -21, -21, -13, -8, 6, 3,
    -1, -11, -25, -25, -11, -1, 3, -6, -4, -5, -13, -13, -5, -4, -6, 3, -4, -15,
    -27, -27, -15, -4, 3, 12, 6, -2, -22, -22, -2, 6, 12, 18, 16, 12, -2, -2,
    12, 16, 18, 9, -1, -19, -17, -17, -19, -1, 9,
  ],
  [
    -9, 1, 19, 17, 17, 19, 1, -9, -18, -16, -12, 2, 2, -12, -16, -18, -12, -6,
    2, 22, 22, 2, -6, -12, -3, 4, 15, 27, 27, 15, 4, -3, 6, 4, 5, 13, 13, 5, 4,
    6, -3, 1, 11, 25, 25, 11, 1, -3, -6, 8, 13, 21, 21, 13, 8, -6, 5, 14, 20,
    31, 31, 20, 14, 5,
  ],

  [
    4, -5, -5, 3, 3, -5, -5, 4, 12, 8, 5, -3, -3, 5, 8, 12, 7, 13, 6, -3, -3, 6,
    13, 7, 8, 9, 5, 4, 4, 5, 9, 8, 5, 12, 14, 0, 0, 14, 12, 5, 8, 6, 10, -4, -4,
    10, 6, 8, 8, 10, 6, -5, -5, 6, 10, 8, -2, 1, -2, -2, -2, -2, 1, -2,
  ],
  [
    2, -1, 2, 2, 2, 2, -1, 2, -8, -10, -6, 5, 5, -6, -10, -8, -8, -6, -10, 4, 4,
    -10, -6, -8, -5, -12, -14, 0, 0, -14, -12, -5, -8, -9, -5, -4, -4, -5, -9,
    -8, -7, -13, -6, 3, 3, -6, -13, -7, -12, -8, -5, 3, 3, -5, -8, -12, -4, 5,
    5, -3, -3, 5, 5, -4,
  ],

  [
    198, 271, 327, 271, 271, 327, 271, 198, 179, 234, 303, 278, 278, 303, 234,
    179, 120, 169, 258, 195, 195, 258, 169, 120, 98, 138, 190, 164, 164, 190,
    138, 98, 70, 105, 179, 154, 154, 179, 105, 70, 31, 81, 145, 123, 123, 145,
    81, 31, 33, 65, 120, 88, 88, 120, 65, 33, -1, 45, 89, 59, 59, 89, 45, -1,
  ],
  [
    1, -45, -89, -59, -59, -89, -45, 1, -33, -65, -120, -88, -88, -120, -65,
    -33, -31, -81, -145, -123, -123, -145, -81, -31, -70, -105, -179, -154,
    -154, -179, -105, -70, -98, -138, -190, -164, -164, -190, -138, -98, -120,
    -169, -258, -195, -195, -258, -169, -120, -179, -234, -303, -278, -278,
    -303, -234, -179, -198, -271, -327, -271, -271, -327, -271, -198,
  ],
];

const egBonus: i16[][] = [
  [
    -21, -49, -65, -96, -96, -65, -49, -21, 8, -18, -54, -67, -67, -54, -18, 8,
    29, -8, -27, -40, -40, -27, -8, 29, 28, 13, -2, -35, -35, -2, 13, 28, 39, 9,
    -16, -45, -45, -16, 9, 39, 17, -16, -44, -51, -51, -44, -16, 17, 12, -51,
    -50, -69, -69, -50, -51, 12, -17, -56, -88, -100, -100, -88, -56, -17,
  ],
  [
    17, 56, 88, 100, 100, 88, 56, 17, -12, 51, 50, 69, 69, 50, 51, -12, -17, 16,
    44, 51, 51, 44, 16, -17, -39, -9, 16, 45, 45, 16, -9, -39, -28, -13, 2, 35,
    35, 2, -13, -28, -29, 8, 27, 40, 40, 27, 8, -29, -8, 18, 54, 67, 67, 54, 18,
    -8, 21, 49, 65, 96, 96, 65, 49, 21,
  ],

  [
    -12, -37, -30, -57, -57, -30, -37, -12, 1, -17, -13, -37, -37, -13, -17, 1,
    10, -2, -1, -16, -16, -1, -2, 10, 17, 0, -6, -20, -20, -6, 0, 17, 15, -14,
    -1, -17, -17, -1, -14, 15, 6, 4, 6, -30, -30, 6, 4, 6, 1, -1, -20, -31, -31,
    -20, -1, 1, -24, -37, -42, -46, -46, -42, -37, -24,
  ],
  [
    24, 37, 42, 46, 46, 42, 37, 24, -1, 1, 20, 31, 31, 20, 1, -1, -6, -4, -6,
    30, 30, -6, -4, -6, -15, 14, 1, 17, 17, 1, 14, -15, -17, 0, 6, 20, 20, 6, 0,
    -17, -10, 2, 1, 16, 16, 1, 2, -10, -1, 17, 13, 37, 37, 13, 17, -1, 12, 37,
    30, 57, 57, 30, 37, 12,
  ],

  [
    -9, -10, -13, -9, -9, -13, -10, -9, -2, -1, -9, -12, -12, -9, -1, -2, -6,
    -2, -8, 6, 6, -8, -2, -6, 7, -9, 1, -6, -6, 1, -9, 7, -6, 7, 8, -5, -5, 8,
    7, -6, 10, -7, 1, 6, 6, 1, -7, 10, -5, 20, 5, 4, 4, 5, 20, -5, 13, 19, 0,
    18, 18, 0, 19, 13,
  ],
  [
    -13, -19, 0, -18, -18, 0, -19, -13, 5, -20, -5, -4, -4, -5, -20, 5, -10, 7,
    -1, -6, -6, -1, 7, -10, 6, -7, -8, 5, 5, -8, -7, 6, -7, 9, -1, 6, 6, -1, 9,
    -7, 6, 2, 8, -6, -6, 8, 2, 6, 2, 1, 9, 12, 12, 9, 1, 2, 9, 10, 13, 9, 9, 13,
    10, 9,
  ],

  [
    -26, -47, -57, -69, -69, -57, -47, -26, -4, -22, -31, -55, -55, -31, -22,
    -4, 3, -9, -18, -39, -39, -18, -9, 3, 24, 13, -3, -23, -23, -3, 13, 24, 21,
    9, -6, -29, -29, -6, 9, 21, 1, -12, -18, -38, -38, -18, -12, 1, -8, -24,
    -27, -50, -50, -27, -24, -8, -36, -43, -52, -75, -75, -52, -43, -36,
  ],
  [
    36, 43, 52, 75, 75, 52, 43, 36, 8, 24, 27, 50, 50, 27, 24, 8, -1, 12, 18,
    38, 38, 18, 12, -1, -21, -9, 6, 29, 29, 6, -9, -21, -24, -13, 3, 23, 23, 3,
    -13, -24, -3, 9, 18, 39, 39, 18, 9, -3, 4, 22, 31, 55, 55, 31, 22, 4, 26,
    47, 57, 69, 69, 57, 47, 26,
  ],

  [
    76, 85, 45, 1, 1, 45, 85, 76, 135, 133, 100, 53, 53, 100, 133, 135, 175,
    169, 130, 88, 88, 130, 169, 175, 172, 172, 156, 103, 103, 156, 172, 172,
    199, 199, 166, 96, 96, 166, 199, 199, 191, 184, 172, 92, 92, 172, 184, 191,
    131, 116, 121, 47, 47, 121, 116, 131, 78, 73, 59, 11, 11, 59, 73, 78,
  ],
  [
    -78, -73, -59, -11, -11, -59, -73, -78, -131, -116, -121, -47, -47, -121,
    -116, -131, -191, -184, -172, -92, -92, -172, -184, -191, -199, -199, -166,
    -96, -96, -166, -199, -199, -172, -172, -156, -103, -103, -156, -172, -172,
    -175, -169, -130, -88, -88, -130, -169, -175, -135, -133, -100, -53, -53,
    -100, -133, -135, -76, -85, -45, -1, -1, -45, -85, -76,
  ],
];

const pawnMgBonus: i16[][] = [
  [
    0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 10, 19, 16, 19, 7, -5, -9, -15, 11, 15, 32,
    22, 5, -22, -4, -23, 6, 20, 40, 17, 4, -8, 13, 0, -13, 1, 11, -2, -13, 5, 5,
    -12, -7, 22, -8, -5, -15, -8, -7, 7, -3, -13, 5, -16, 10, -8, 0, 0, 0, 0, 0,
    0, 0, 0,
  ],

  [
    0, 0, 0, 0, 0, 0, 0, 0, 7, -7, 3, 13, -5, 16, -10, 8, -5, 12, 7, -22, 8, 5,
    15, 8, -13, 0, 13, -1, -11, 2, 13, -5, 4, 23, -6, -20, -40, -17, -4, 8, 9,
    15, -11, -15, -32, -22, -5, 22, -3, -3, -10, -19, -16, -19, -7, 5, 0, 0, 0,
    0, 0, 0, 0, 0,
  ],
];

const pawnEgBonus: i16[][] = [
  [
    0, 0, 0, 0, 0, 0, 0, 0, -10, -6, 10, 0, 14, 7, -5, -19, -10, -10, -10, 4, 4,
    3, -6, -4, 6, -2, -8, -4, -13, -12, -10, -9, 10, 5, 4, -5, -5, -5, 14, 9,
    28, 20, 21, 28, 30, 7, 6, 13, 0, -11, 12, 21, 25, 19, 4, 7, 0, 0, 0, 0, 0,
    0, 0, 0,
  ],

  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 11, -12, -21, -25, -19, -4, -7, -28, -20, -21,
    -28, -30, -7, -6, -13, -10, -5, -4, 5, 5, 5, -14, -9, -6, 2, 8, 4, 13, 12,
    10, 9, 10, 10, 10, -4, -4, -3, 6, 4, 10, 6, -10, 0, -14, -7, 5, 19, 0, 0, 0,
    0, 0, 0, 0, 0,
  ],
];

//const X_MASK: i8 = 1 << (3 - 1);

// Piece square table bonuses
export function psqtBonus(board: BitBoard, mg: boolean): i16 {
  const bonus = mg ? mgBonus : egBonus;
  const pawnBonus = mg ? pawnMgBonus : pawnEgBonus;
  let result: i16 = 0;
  for (let piece = 0; piece < 2; piece++) {
    const pieceMask = unchecked(board.bits[piece]);
    positions.reset(pieceMask);
    while (positions.hasNext()) {
      const position = positions.next();
      //const x: i8 = position & X_MASK;
      //const y: i8 = position >> 3;
      result += unchecked(pawnBonus[piece][position]);
    }
  }
  for (let piece: i8 = 2; piece < 12; piece++) {
    const pieceMask = unchecked(board.bits[piece]);
    positions.reset(pieceMask);
    while (positions.hasNext()) {
      const position = positions.next();
      result += unchecked(bonus[piece - 2][position]);
    }
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
