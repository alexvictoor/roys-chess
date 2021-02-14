// The entry file of your WebAssembly module.

export const add = (a: i32, b: i32): i32 => {
  return a + b;
};

export const even = (): i32[] => {
  return [1, 2, 3, 4, 5].filter((n) => n % 2 === 0);
};
