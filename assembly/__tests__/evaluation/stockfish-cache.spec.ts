import { BLACK, WHITE } from "../../bitboard";
import { getValueFromCache, getValueFromCacheU64, isInCache, resetCache, setValueInCache, setValueInCacheU64 } from "../../evaluation/stockfish-cache";



describe("Stockfish cache", () => {
  it("should write and read in cache", () => {
    setValueInCache(24, WHITE, 123);
    expect(isInCache(24, WHITE)).toBe(true);
    expect(isInCache(24, BLACK)).toBe(false);
    setValueInCache(24, BLACK, 36);
    expect(getValueFromCache(24, WHITE)).toBe(123);
    expect(getValueFromCache(24, BLACK)).toBe(36);
    setValueInCacheU64(7, WHITE, 5466747);
    expect(getValueFromCacheU64(7, WHITE)).toBe(5466747);
    resetCache();
    expect(isInCache(24, WHITE)).toBe(false);
  });


});
