import { BitBoard } from "../bitboard";
import { MoveOutcome, PieceOnBoard, QUEEN, WHITE } from "../chess";
import { queenPseudoLegalMoves } from "../queen";

describe(`Queen`, () => {
  it("should move as rooks and bishops", () => {
    // given
    const piece: PieceOnBoard = {
      position: { x: 2, y: 2 },
      piece: QUEEN,
      color: WHITE,
    };
    const board = BitBoard.buildFromPieces([piece]);
    // when
    const positions = queenPseudoLegalMoves(board, piece);
    // then
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 1,
      y: 2,
      capturedPiece: -1,
      captureEnPassant: null,
      promoteTo: -1,
    });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 7,
      y: 2,
      capturedPiece: -1,
      captureEnPassant: null,
      promoteTo: -1,
    });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 2,
      y: 0,
      capturedPiece: -1,
      captureEnPassant: null,
      promoteTo: -1,
    });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 2,
      y: 7,
      capturedPiece: -1,
      captureEnPassant: null,
      promoteTo: -1,
    });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 1,
      y: 1,
      capturedPiece: -1,
      captureEnPassant: null,
      promoteTo: -1,
    }); // bishop position
  });
});
