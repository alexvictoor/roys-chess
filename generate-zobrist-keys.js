const fs = require("fs");
const loader = require("@assemblyscript/loader");

const wasm = loader.instantiateSync(
  fs.readFileSync(__dirname + "/build/optimized.wasm"),
  {
    /* imports */
  }
);
const randomKeys = wasm.exports.__getString(wasm.exports.generateZobristKeys());
process.stdout.write(`export const zobristKeys: u64[] = [ ${randomKeys} ];`);
