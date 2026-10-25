import { pickBookMoveIndex } from "../../opening-book";

// Fix 25 (audit B2): the pick was Math.ceil(random * n), which is 0 (the
// slot holding the move count, not a move) when random is 0, and could
// never return the first move otherwise.
describe("Fix 25: the opening book pick stays inside the move list", () => {
  it("maps 0 to the first move", () => {
    expect(pickBookMoveIndex(0, 3)).toBe(0);
  });

  it("maps the top of the range to the last move", () => {
    expect(pickBookMoveIndex(0.999, 3)).toBe(2);
  });

  it("never runs past the last move", () => {
    expect(pickBookMoveIndex(1, 3)).toBe(2);
  });

  it("spreads the range evenly", () => {
    expect(pickBookMoveIndex(0.34, 3)).toBe(1);
    expect(pickBookMoveIndex(0.67, 3)).toBe(2);
  });
});
