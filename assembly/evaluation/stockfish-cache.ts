const store =  new StaticArray<u64>(64);
let flags = <u64>0;


function buildIndex(key: i8, player: i8): i8 {
  return (key << 1) + player;
}

export function isInCache(key: i8, player: i8): boolean {
  return !!((<u64>1 << buildIndex(key, player)) & flags);
}
export function getValueFromCache(key: i8, player: i8): i16 {
  return unchecked(<i16>store[buildIndex(key, player)]);
}

export function getValueFromCacheU64(key: i8, player: i8): u64 {
    return unchecked(store[buildIndex(key, player)]);
  }

export function setValueInCache(key: i8, player: i8, value: i16): void {
   unchecked(store[buildIndex(key, player)] = <u64>value);
   flags |= <u64>1 << buildIndex(key, player);
}
export function setValueInCacheU64(key: i8, player: i8, value: u64): void {
   unchecked(store[buildIndex(key, player)] = value);
   flags |= <u64>1 << buildIndex(key, player);
}

export function resetCache(): void {
  flags = 0;
}

export const CANDIDATE_PASSED_MASK_KEY: i8 = 0;
export const PASSED_BLOCK_BONUS_KEY: i8 = 1;
export const PASSED_LEVERAGE_MASK_KEY: i8 = 2;
export const RESTRICTED_MASK_KEY: i8 = 3;
export const ATTACK_ONCE_MASK_KEY: i8 = 4;
export const ATTACK_TWICE_MASK_KEY: i8 = 5;
export const KING_DANGER_KEY: i8 = 6;
export const WEAK_SQUARE_MASK_KEY: i8 = 7;
export const NON_PAWN_PATERIAL_KEY: i8 = 8; // bof bof
export const BLOCKERS_FOR_KING_MASK_KEY: i8 = 9; 
export const ATTACK_BY_KNIGHTS_MASK_KEY: i8 = 10; 
export const ATTACK_BY_BISHOPS_MASK_KEY: i8 = 11; 
export const ATTACK_BY_ROOKS_MASK_KEY: i8 = 12; 
export const ATTACK_BY_QUEENS_MASK_KEY: i8 = 13; 
export const ATTACK_BY_KINGS_MASK_KEY: i8 = 14; 
export const FLANK_ATTACK_KEY: i8 = 15;
export const MOBILITY_AREA_MASK_KEY: i8 = 16; 
export const IMBALANCE_TOTAL_KEY: i8 = 17; 