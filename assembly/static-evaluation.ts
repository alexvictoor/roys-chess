import { BitBoard, BLACK, MaskIterator, PLAYER_PIECES, WHITE } from "./bitboard";
import { EvaluationTable } from "./evaluation-table";
import { mainEvaluation } from "./evaluation/stockfish-static-evaluation";

const WHITE_PAWN_WEIGHTS: i16[] = [
  0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, -20, -20, 10, 10, 5, 5, -5, -10, 0, 0, -10,
  -5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, 5, 10, 25, 25, 10, 5, 5, 10, 10, 20, 30,
  30, 20, 10, 10, 50, 50, 50, 50, 50, 50, 50, 50, 0, 0, 0, 0, 0, 0, 0, 0,
];

const BLACK_PAWN_WEIGHTS: i16[] = [
  0, 0, 0, 0, 0, 0, 0, 0, -50, -50, -50, -50, -50, -50, -50, -50, -10, -10, -20,
  -30, -30, -20, -10, -10, -5, -5, -10, -25, -25, -10, -5, -5, 0, 0, 0, -20,
  -20, 0, 0, 0, -5, 5, 10, 0, 0, 10, 5, -5, -5, -10, -10, 20, 20, -10, -10, -5,
  0, 0, 0, 0, 0, 0, 0, 0,
];

const WHITE_KNIGHT_WEIGHTS: i16[] = [
  -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 5, 5, 0, -20, -40, -30,
  5, 10, 15, 15, 10, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 15, 20, 20,
  15, 5, -30, -30, 0, 10, 15, 15, 10, 0, -30, -40, -20, 0, 0, 0, 0, -20, -40,
  -50, -40, -30, -30, -30, -30, -40, -50,
];

const BLACK_KNIGHT_WEIGHTS: i16[] = [
  50, 40, 30, 30, 30, 30, 40, 50, 40, 20, 0, 0, 0, 0, 20, 40, 30, 0, -10, -15,
  -15, -10, 0, 30, 30, -5, -15, -20, -20, -15, -5, 30, 30, 0, -15, -20, -20,
  -15, 0, 30, 30, -5, -10, -15, -15, -10, -5, 30, 40, 20, 0, -5, -5, 0, 20, 40,
  50, 40, 30, 30, 30, 30, 40, 50,
];

const WHITE_BISHOP_WEIGHTS: i16[] = [
  -20, -10, -10, -10, -10, -10, -10, -20, -10, 5, 0, 0, 0, 0, 5, -10, -10, 10,
  10, 10, 10, 10, 10, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 5, 5, 10, 10, 5,
  5, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 0, 0, 0, 0, 0, 0, -10, -20, -10,
  -10, -10, -10, -10, -10, -20,
];

const BLACK_BISHOP_WEIGHTS: i16[] = [
  20, 10, 10, 10, 10, 10, 10, 20, 10, 0, 0, 0, 0, 0, 0, 10, 10, 0, -5, -10, -10,
  -5, 0, 10, 10, -5, -5, -10, -10, -5, -5, 10, 10, 0, -10, -10, -10, -10, 0, 10,
  10, -10, -10, -10, -10, -10, -10, 10, 10, -5, 0, 0, 0, 0, -5, 10, 20, 10, 10,
  10, 10, 10, 10, 20,
];

const WHITE_ROOK_WEIGHTS: i16[] = [
  0, 0, 0, 5, 5, 0, 0, 0, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5,
  5, 10, 10, 10, 10, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0,
];

const BLACK_ROOK_WEIGHTS: i16[] = [
  0, 0, 0, 0, 0, 0, 0, 0, -5, -10, -10, -10, -10, -10, -10, -5, 5, 0, 0, 0, 0,
  0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0,
  5, 5, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, -5, -5, 0, 0, 0,
];

const WHITE_QUEEN_WEIGHTS: i16[] = [
  -20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 5, 0, -10, -10, 0, 5,
  5, 5, 5, 5, -10, -5, 0, 5, 5, 5, 5, 0, 0, -5, 0, 5, 5, 5, 5, 0, -5, -10, 0, 5,
  5, 5, 5, 0, -10, -10, 0, 0, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10,
  -20,
];

const BLACK_QUEEN_WEIGHTS: i16[] = [
  20, 10, 10, 5, 5, 10, 10, 20, 10, 0, 0, 0, 0, 0, 0, 10, 10, 0, -5, -5, -5, -5,
  0, 10, 5, 0, -5, -5, -5, -5, 0, 5, 0, 0, -5, -5, -5, -5, 0, 5, 10, -5, -5, -5,
  -5, -5, 0, 10, 10, 0, -5, 0, 0, 0, 0, 10, 20, 10, 10, 5, 5, 10, 10, 20,
];

const WHITE_KING_MIDDLE_GAME_WEIGHTS: i16[] = [
  20, 30, 10, 0, 0, 10, 30, 20, 20, 20, 0, 0, 0, 0, 20, 20, -10, -20, -20, -20,
  -20, -20, -20, -10, -20, -30, -30, -40, -40, -30, -30, -20, -30, -40, -40,
  -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40,
  -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30,
];

const BLACK_KING_MIDDLE_GAME_WEIGHTS: i16[] = [
  30, 40, 40, 50, 50, 40, 40, 30, 30, 40, 40, 50, 50, 40, 40, 30, 30, 40, 40,
  50, 50, 40, 40, 30, 30, 40, 40, 50, 50, 40, 40, 30, 20, 30, 30, 40, 40, 30,
  30, 20, 10, 20, 20, 20, 20, 20, 20, 10, -20, -20, 0, 0, 0, 0, -20, -20, -20,
  -30, -10, 0, 0, -10, -30, -20,
];

const WHITE_KING_END_GAME_WEIGHTS: i16[] = [
  -50, -30, -30, -30, -30, -30, -30, -50, -30, -30, 0, 0, 0, 0, -30, -30, -30,
  -10, 20, 30, 30, 20, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10,
  30, 40, 40, 30, -10, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -20, -10,
  0, 0, -10, -20, -30, -50, -40, -30, -20, -20, -30, -40, -50,
];

const BLACK_KING_END_GAME_WEIGHTS: i16[] = [
  50, 40, 30, 20, 20, 30, 40, 50, 30, 20, 10, 0, 0, 10, 20, 30, 30, 10, -20,
  -30, -30, -20, 10, 30, 30, 10, -30, -40, -40, -30, 10, 30, 30, 10, -30, -40,
  -40, -30, 10, 30, 30, 10, -20, -30, -30, -20, 10, 30, 30, 30, 0, 0, 0, 0, 30,
  30, 50, 30, 30, 30, 30, 30, 30, 50,
];

const WEIGHTS_MIDDLE_GAME: i16[][] = [
  WHITE_PAWN_WEIGHTS,
  BLACK_PAWN_WEIGHTS,
  WHITE_KNIGHT_WEIGHTS,
  BLACK_KNIGHT_WEIGHTS,
  WHITE_BISHOP_WEIGHTS,
  BLACK_BISHOP_WEIGHTS,
  WHITE_ROOK_WEIGHTS,
  BLACK_ROOK_WEIGHTS,
  WHITE_QUEEN_WEIGHTS,
  BLACK_QUEEN_WEIGHTS,
  WHITE_KING_MIDDLE_GAME_WEIGHTS,
  BLACK_KING_MIDDLE_GAME_WEIGHTS,
];
const WEIGHTS_END_GAME: i16[][] = [
  WHITE_PAWN_WEIGHTS,
  BLACK_PAWN_WEIGHTS,
  WHITE_KNIGHT_WEIGHTS,
  BLACK_KNIGHT_WEIGHTS,
  WHITE_BISHOP_WEIGHTS,
  BLACK_BISHOP_WEIGHTS,
  WHITE_ROOK_WEIGHTS,
  BLACK_ROOK_WEIGHTS,
  WHITE_QUEEN_WEIGHTS,
  BLACK_QUEEN_WEIGHTS,
  WHITE_KING_END_GAME_WEIGHTS,
  BLACK_KING_END_GAME_WEIGHTS,
];

export const PIECE_VALUES: i16[] = [
  100, -100, 320, -320, 330, -330, 500, -500, 900, -900, 20000, -20000,
];

for (let piece: i8 = 0; piece < PIECE_VALUES.length; piece++) {
  for (let position: i8 = 0; position < 64; position++) {
    WEIGHTS_MIDDLE_GAME[piece][position] += PIECE_VALUES[piece];
    WEIGHTS_END_GAME[piece][position] += PIECE_VALUES[piece];
  }
}

export function isPastStartGame(board: BitBoard): boolean {
  const pieceCount = popcnt(board.getAllPiecesMask());
  return pieceCount < 28;
}
export function isPastMiddleGame(board: BitBoard): boolean {
  const pieceCount = popcnt(board.getAllPiecesMask());
  return pieceCount < 20;
}

const positions = new MaskIterator();

export function OLD_evaluate(player: i8, board: BitBoard): i16 {
  const weights = isPastMiddleGame(board)
    ? WEIGHTS_END_GAME
    : WEIGHTS_MIDDLE_GAME;
  let result: i16 = 0;
  for (let piece = 0; piece < 12; piece++) {
    const pieceMask = unchecked(board.bits[piece]);
    positions.reset(pieceMask);
    while (positions.hasNext()) {
      const position = positions.next();
      result += unchecked(weights[piece][position]);
    }
  }
  if (player === BLACK) {
    result = -result;
  }
  return result;
}

const table = new EvaluationTable();

let verbose: boolean = true;
let count: i32 = 0;

export function evaluate(player: i8, board: BitBoard): i16 {
  const cachedEvaluation = table.getCachedEvaluation(board);
  if (cachedEvaluation) {
    return cachedEvaluation;
  }
  count++;

  /*if (verbose && count > 188360) {
    trace(board.toFEN());
  }*/

  const evaluation = mainEvaluation(player, board) * ((player === WHITE ? 1 : -1));
  /*if (board.hashCode() == 216317760343299884) {
    trace(board.toFEN() + " /// " + evaluation.toString() + " /// " + player.toString() + ' / ' + count.toString());
    verbose = false;
  }*/
  /*const cachedEvaluation = table.getCachedEvaluation(board);
  if (cachedEvaluation) {
    if (cachedEvaluation == evaluation) {
      //trace('chouette');
    } else {

      trace(board.hashCode().toString() + ' ' + cachedEvaluation.toString() + ' ' + evaluation.toString());
    }
  }*/
  table.record(board, evaluation);
  return evaluation;
}
