import { BitBoard, fromUciNotation } from "../bitboard";
import { parseFEN } from "../fen-parser";
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

        trace(data2.join(", "))
        expect(data.length).toBe(data2.length);

    });
})