import { parseFEN } from "./fen-parser";

describe("FEN parser", () => {
  it("should parse piece positions", () => {
    // given
    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    // when
    const { board } = parseFEN(fen);
    // then
    expect(board.getAt({ x: 4, y: 0 })).toEqual(
      expect.objectContaining({
        color: "Black",
        piece: "King",
      })
    );
    expect(board.getAt({ x: 3, y: 0 })).toEqual(
      expect.objectContaining({
        color: "Black",
        piece: "Queen",
      })
    );
    expect(board.getAt({ x: 2, y: 0 })).toEqual(
      expect.objectContaining({
        color: "Black",
        piece: "Bishop",
      })
    );
    expect(board.getAt({ x: 1, y: 0 })).toEqual(
      expect.objectContaining({
        color: "Black",
        piece: "Knight",
      })
    );
    expect(board.getAt({ x: 0, y: 0 })).toEqual(
      expect.objectContaining({
        color: "Black",
        piece: "Rook",
      })
    );
    expect(board.getAt({ x: 0, y: 7 })).toEqual(
      expect.objectContaining({
        color: "White",
        piece: "Rook",
      })
    );
    expect(board.getAt({ x: 4, y: 7 })).toEqual(
      expect.objectContaining({
        color: "White",
      })
    );
  });
  it("should parse position of a piece alone on its row", () => {
    // given
    const fen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";
    // when
    const { board } = parseFEN(fen);
    console.log(board + "");
    // then
    expect(board.getAt({ x: 4, y: 4 })).toEqual(
      expect.objectContaining({
        color: "White",
        piece: "Pawn",
      })
    );
  });
  it("should parse player who plays next", () => {
    // given
    const fen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";
    // when
    const { player } = parseFEN(fen);
    // then
    expect(player).toEqual("Black");
  });
  it("should parse castling rights", () => {
    // given
    const fen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b Kk e3 0 1";
    // when
    const { board } = parseFEN(fen);
    // then
    expect(board.kingSideCastlingRight("Black")).toBe(true);
    expect(board.queenSideCastlingRight("Black")).toBe(false);
  });

  it("should parse half move clock", () => {
    // given
    const fen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b Kk e3 7 1";
    // when
    const { board } = parseFEN(fen);
    // then
    expect(board.halfMoveClock).toBe(7);
  });
});
