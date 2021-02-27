export const noBorderMask: u64 =
  (((1 << 48) - 1) << 8) ^
  ((1 << 8) | (1 << 16) | (1 << 24) | (1 << 32) | (1 << 40) | (1 << 48)) ^
  ((1 << 15) | (1 << 23) | (1 << 31) | (1 << 39) | (1 << 47) | (1 << 55));

export const leftBorderMask: u64 = ~(
  1 |
  (1 << 8) |
  (1 << 16) |
  (1 << 24) |
  (1 << 32) |
  (1 << 40) |
  (1 << 48) |
  (1 << 56)
);

export const rightBorderMask: u64 = ~(
  (1 << 7) |
  (1 << 15) |
  (1 << 23) |
  (1 << 31) |
  (1 << 39) |
  (1 << 47) |
  (1 << 55) |
  (1 << 63)
);
export function maskString(mask: u64): string {
  let result: string = "\n";
  for (let i: i8 = 7; i >= 0; i--) {
    for (let j: i8 = 0; j < 8; j++) {
      result += mask & (1 << (i * 8 + j)) ? "1" : ".";
    }
    result += "\n";
  }
  return result;
}
