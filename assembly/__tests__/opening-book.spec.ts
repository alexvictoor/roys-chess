import { fromUciNotation } from "../bitboard";
import { parseFEN } from "../fen-parser";
import { openingBookData } from "../generated-opening-book";
import { generateOpeningBookData, findMoveInOpeningBook } from "../opening-book";

describe("Opening Book", () => {
    it("should find move (level 1)", () => {
        const input = `eco	name	pgn	uci	epd
        A00	Amar Gambit	1. Nh3 d5 2. g3 e5 3. f4 Bxh3 4. Bxh3 exf4	g1h3 d7d5 g2g3 e7e5 f2f4 c8h3 f1h3 e5f4	rn1qkbnr/ppp2ppp/8/3p4/5p2/6PB/PPPPP2P/RNBQK2R w KQkq -
        `;
        const data = generateOpeningBookData(input);

        const board = parseFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

        const move = findMoveInOpeningBook(data, board);

        expect(move).toBe(fromUciNotation('g1h3', board));

        board.do(move)

        const secondMove = findMoveInOpeningBook(data, board);

        expect(secondMove).toBe(fromUciNotation('d7d5', board));

        board.do(secondMove)

        const thirdMove = findMoveInOpeningBook(data, board);

        expect(thirdMove).toBe(fromUciNotation('g2g3', board));

    });

    it("should not have duplicates", () => {
        const input = `eco	name	pgn	uci	epd
        A00	Amar Gambit	1. Nh3 d5 2. g3 e5 3. f4 Bxh3 4. Bxh3 exf4	g1h3 d7d5 g2g3 e7e5 f2f4 c8h3 f1h3 e5f4	rn1qkbnr/ppp2ppp/8/3p4/5p2/6PB/PPPPP2P/RNBQK2R w KQkq -
        `;
        const inputWithTwiceTheSameMoves = `eco	name	pgn	uci	epd
        A00	Amar Gambit	1. Nh3 d5 2. g3 e5 3. f4 Bxh3 4. Bxh3 exf4	g1h3 d7d5 g2g3 e7e5 f2f4 c8h3 f1h3 e5f4	rn1qkbnr/ppp2ppp/8/3p4/5p2/6PB/PPPPP2P/RNBQK2R w KQkq -
        A00	Amar Gambit	1. Nh3 d5 2. g3 e5 3. f4 Bxh3 4. Bxh3 exf4	g1h3 d7d5 g2g3 e7e5 f2f4 c8h3 f1h3 e5f4	rn1qkbnr/ppp2ppp/8/3p4/5p2/6PB/PPPPP2P/RNBQK2R w KQkq -
        `;
        const data = generateOpeningBookData(input);
        const data2 = generateOpeningBookData(inputWithTwiceTheSameMoves);

        expect(data.length).toBe(data2.length);

    });

    it("should find classic sicilian first black move", () => {
        const input = `eco	name	pgn	uci	epd
B06	Pterodactyl Defense: Eastern, Benoni Pterodactyl	1. d4 g6 2. Nc3 Bg7 3. e4 c5 4. d5 Qa5	d2d4 g7g6 b1c3 f8g7 e2e4 c7c5 d4d5 d8a5	rnb1k1nr/pp1pppbp/6p1/q1pP4/4P3/2N5/PPP2PPP/R1BQKBNR w KQkq -
B99	Sicilian Defense: Najdorf Variation, Main Line	1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Bg5 e6 7. f4 Be7 8. Qf3 Qc7 9. O-O-O Nbd7	e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 a7a6 c1g5 e7e6 f2f4 f8e7 d1f3 d8c7 e1c1 b8d7	r1b1k2r/1pqnbppp/p2ppn2/6B1/3NPP2/2N2Q2/PPP3PP/2KR1B1R w kq -
A38	English Opening: Symmetrical Variation, Double Fianchetto	1. c4 c5 2. Nc3 Nc6 3. g3 g6 4. Bg2 Bg7 5. Nf3 Nf6 6. O-O O-O 7. b3	c2c4 c7c5 b1c3 b8c6 g2g3 g7g6 f1g2 f8g7 g1f3 g8f6 e1g1 e8g8 b2b3	r1bq1rk1/pp1pppbp/2n2np1/2p5/2P5/1PN2NP1/P2PPPBP/R1BQ1RK1 b - -
        `;
       
        const data = generateOpeningBookData(input);
        trace(data.join(' '))
        const board = parseFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        const firstWhiteMove = fromUciNotation('e2e4', board);
        board.do(firstWhiteMove);
        const firstBlackMove = findMoveInOpeningBook(data, board);
        expect(firstBlackMove).not.toBe(0);

    });

    it("should find classic first black move", () => {
        const board = parseFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        const firstWhiteMove = fromUciNotation('e2e4', board);
        board.do(firstWhiteMove);
        const firstBlackMove = findMoveInOpeningBook(openingBookData, board);
        expect(firstBlackMove).not.toBe(0);
    });
})