const fs = require("fs");
const loader = require("@assemblyscript/loader");

const wasm = loader.instantiateSync(
  fs.readFileSync(__dirname + "/build/optimized.wasm"),
  {
    /* imports */
  }
);
//console.log(wasm.exports.perf());
const start = Date.now();
console.log(wasm.exports.benchPerft());
console.log(Date.now() - start, "ms");

const start2 = Date.now();
console.log(wasm.exports.benchPerftOptimized());
console.log(Date.now() - start2, "ms");
