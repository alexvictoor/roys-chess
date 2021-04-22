import {
  BitBoard,
  BLACK,
  encodeMove,
  encodePawnDoubleMove,
  KING,
  maskString,
  opponent,
  PAWN,
  ROOK,
  toNotation,
  WHITE,
} from "../../fast/bitboard";
import { legalMoves } from "../../fast/engine";
import { parseFEN } from "../../fast/fen-parser";
import { perft, perft2 } from "../../fast/perft";

function perftDivide(depth: i8, board: BitBoard, player: i8): string {
  const boards = legalMoves(board, player);
  let result: string = "";
  for (let index = 0; index < boards.length; index++) {
    const b = boards[index];
    result +=
      toNotation(<u32>b.getPreviousMove()) +
      " " +
      (depth == 1 ? "1" : perft(depth - 1, b, opponent(player)).toString()) +
      "\n";
  }
  return result;
}

describe("Perft", () => {
  xit("should perft from initial", () => {
    const initialBoard =
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    log(parseFEN(initialBoard).toString());
    const result = perft2(3, parseFEN(initialBoard), WHITE);
    expect(result).toBe(8902);
    //expect(result).toBe(4865609);
  });
  xit("should perft from r3k2r/pb3p2/5npp/n2p4/1p1PPB2/6P1/P2N1PBP/R3K2R b KQkq - ", () => {
    const board = "r3k2r/pb3p2/5npp/n2p4/1p1PPB2/6P1/P2N1PBP/R3K2R b KQkq -";

    //return <f64>perft2(4, parseFEN(board), BLACK);
    //log(parseFEN(board).toString());
    expect(<f64>perft2(4, parseFEN(board), BLACK)).toBe(<f64>909807);
  });
  xit("should perft from 8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - ", () => {
    // interessant
    const board = "8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - ";
    log(parseFEN(board).toString());
    const result = perft(3, parseFEN(board), WHITE);
    expect(result).toBe(2812);
  });
  xit("should perft r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1", () => {
    const board =
      "r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1";
    log(parseFEN(board).toString());
    const result = perft(3, parseFEN(board), WHITE);
    expect(result).toBe(9467);
  });
  xit("should perft rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8", () => {
    const board = "rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8";
    log(parseFEN(board).toString());
    expect(perft(4, parseFEN(board), WHITE)).toBe(2103487);
  });
  xit("should perft bqnb1rkr/pp3ppp/3ppn2/2p5/5P2/P2P4/NPP1P1PP/BQ1BNRKR w HFhf - 2 9	", () => {
    const board =
      "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1";
    log(parseFEN(board).toString());
    expect(perft(1, parseFEN(board), WHITE)).toBe(48);
    expect(perft(4, parseFEN(board), WHITE)).toBe(4085603);
  });
  xit("should perft r3k2r/p6p/8/B7/1pp1p3/3b4/P6P/R3K2R w KQkq -", () => {
    const board = "r3k2r/p6p/8/B7/1pp1p3/3b4/P6P/R3K2R w KQkq -";
    log(parseFEN(board).toString());
    expect(perft(1, parseFEN(board), WHITE)).toBe(17);
    expect(perft(2, parseFEN(board), WHITE)).toBe(341);
    expect(perft(3, parseFEN(board), WHITE)).toBe(6666);
    expect(perft(4, parseFEN(board), WHITE)).toBe(150072); // plante ici
  });
  xit("should perft 8/5p2/8/2k3P1/p3K3/8/1P6/8 b - -", () => {
    const board = "8/5p2/8/2k3P1/p3K3/8/1P6/8 b - -";
    log(parseFEN(board).toString());
    expect(perft(1, parseFEN(board), BLACK)).toBe(9);
    expect(perft(2, parseFEN(board), BLACK)).toBe(85);
    expect(perft(3, parseFEN(board), BLACK)).toBe(795);
    expect(perft(6, parseFEN(board), BLACK)).toBe(703851);
  });
  xit("should perft r3k2r/pb3p2/5npp/n2p4/1p1PPB2/6P1/P2N1PBP/R3K2R b KQkq -", () => {
    const board = parseFEN(
      "r3k3/pb3p1r/5npp/n2p4/1p1PPB2/6P1/P2N1PBP/R3K2R w KQq -"
    );
    log(board.toString());
    const boards = legalMoves(board, WHITE);
    let result: u64 = 0;
    for (let index = 0; index < boards.length; index++) {
      const b = boards[index];
      //log(b.toString());
      const p = perft(2, b, BLACK);
      log(b.toFEN() + " " + p.toString());
      result += p;
    }
    expect(result).toBe(27755);
    expect(boards.length).toBe(33);
    expect(perft(3, board, WHITE)).toBe(27755);

    //expect(perft(4, board, BLACK)).toBe(909807);
  });
  xit("should perft r3k2r/pb3p2/5npp/n2p4/1p1PPB2/6P1/P2N1PBP/R3K2R b KQkq -", () => {
    const board = "r3k2r/pb3p2/5npp/n2p4/1p1PPB2/6P1/P2N1PBP/R3K2R b KQkq -";
    log(parseFEN(board).toString());
    expect(perft(1, parseFEN(board), BLACK)).toBe(29);
    expect(perft(2, parseFEN(board), BLACK)).toBe(953);
    expect(perft(3, parseFEN(board), BLACK)).toBe(27990);
    //expect(perft(5, parseFEN(board), BLACK)).toBe(26957954); //lent
  });
  xit("should perft r3k2r/pb3p2/5npp/n2p4/1p1PPB2/6P1/P2N1PBP/R3K2R b KQkq -", () => {
    const board = parseFEN(
      "r3k2r/pb3p2/5npp/n2p4/1p1PPB2/6P1/P2N1PBP/R3K2R b KQkq -"
    );
    log(perftDivide(3, board, BLACK));
  });
  xit("should perft r3k2r/pb3p2/5npp/n2p4/1p1PPB2/6P1/P2N1PBP/R3K2R b KQkq -", () => {
    const board = parseFEN(
      "r3k2r/pb3p2/5npp/n2p4/1p1PPB2/6P1/P2N1PBP/R3K2R b KQkq -"
    );
    const board2 = board.execute(
      encodeMove(ROOK + BLACK, 63, ROOK + BLACK, 55)
    );
    log(board2.toFEN());
    log(perftDivide(2, board, WHITE));
  });
  xit("should perft r3k2r/pb3p2/5npp/n2p4/1p1PPB2/6P1/P2N1PBP/R3K2R b KQkq -", () => {
    const board = parseFEN(
      "r3k2r/pb3p2/5npp/n2p4/1p1PPB2/6P1/P2N1PBP/R3K2R b KQkq -"
    );
    const board2 = board.execute(
      encodeMove(ROOK + BLACK, 63, ROOK + BLACK, 55)
    );
    const board3 = board2.execute(encodeMove(ROOK + WHITE, 0, ROOK + WHITE, 1));
    log(board3.toFEN());
    log(perftDivide(1, board3, BLACK));
  });
  xit("should perft r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1", () => {
    const board =
      "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1";
    log(parseFEN(board).toString());
    expect(perft2(1, parseFEN(board), WHITE)).toBe(48);
    expect(perft2(2, parseFEN(board), WHITE)).toBe(2039);
    expect(perft2(3, parseFEN(board), WHITE)).toBe(97862);
    //expect(perft(5, parseFEN(board), WHITE)).toBe(4085603);
  });
  xit("should perft r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10", () => {
    const board =
      "r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10";
    log(parseFEN(board).toString());
    const result = perft(2, parseFEN(board), WHITE);
    expect(result).toBe(2079);
  });
  xit("should perft 8/p7/8/1P6/K1k3p1/6P1/7P/8 w - -", () => {
    const board = parseFEN("8/p7/8/1P6/K1k3p1/6P1/7P/8 w - -");
    log(board.toString());
    const result = perft(3, board, WHITE);
    expect(result).toBe(237);
    /*expect(perft(4, board, WHITE)).toBe(2002);
    expect(perft(5, board, WHITE)).toBe(14062);
    expect(perft(6, board, WHITE)).toBe(120995);*/
    expect(perft(8, board, WHITE)).toBe(8103790);
  });
  xit("should perft 8/p7/8/1P6/K1k3p1/6P1/7P/8 w - -", () => {
    const board = parseFEN("8/p7/8/1P6/K1k3p1/6P1/7P/8 w - -");
    //log(board.toString());
    const board2 = board.execute(encodePawnDoubleMove(WHITE, 15, 15 + 16));
    log("init " + board2.toString());
    expect(perft(1, board2, BLACK)).toBe(8);
    expect(perft(2, board2, BLACK)).toBe(41);
    const moves = legalMoves(board2, BLACK);
    //log(moves[0]);
    for (let index = 0; index < moves.length; index++) {
      const board3 = moves[index];
      const moves2 = legalMoves(board3, WHITE);
      log(
        "index " +
          index.toString() +
          " " +
          moves2.length.toString() +
          " " +
          moves[index].toString()
      );
      /*for (let j = 0; j < moves2.length; j++) {
        log(moves2[j].toString());
      }*/
    }
    //expect(moves).toHaveLength(41);
  });
  xit("should perft 8/p7/8/1P6/K1k3p1/6P1/7P/8 w - -", () => {
    const board = parseFEN("8/p7/8/1P6/K1k3p1/6P1/7P/8 w - -");
    //log(board.toString());
    const board2 = board.execute(encodePawnDoubleMove(WHITE, 15, 15 + 16));
    const board3 = board.execute(encodePawnDoubleMove(BLACK, 48, 48 - 16));
    log("init " + board3.toString());
    //expect(perft(2, board2, BLACK)).toBe(41);
    //const moves = legalMoves(board2, BLACK);
    //log(moves[0]);
    /*for (let index = 0; index < moves.length; index++) {
      log(moves[index].toString());
    }*/
    const moves = legalMoves(board3, WHITE);
    for (let index = 0; index < moves.length; index++) {
      log(moves[index].toString());
    }
    //expect(moves).toHaveLength(41);
  });
});
