const loader = require("@assemblyscript/loader");
const fs = require("fs");

const wasm = loader.instantiateSync(
  fs.readFileSync(__dirname + "/build/optimized.wasm"),
  //fs.readFileSync(__dirname + "/build/untouched.wasm"),
  {
    /* imports */
  }
);
//console.log(wasm.exports.perf());
const start = Date.now();
console.log(
  wasm.exports.__getString(
    wasm.exports.nextMove(
      wasm.exports.__newString(
        //"3rk1r1/p4p2/2n3pp/1R1bB3/3Pp3/6P1/P4PBP/4K2R w Kq - 0 1"
        "4k1r1/p4p2/6pp/4n3/4B3/6P1/P3KP1P/7R b  -"
      ),
      1
    )
  )
);
console.log(Date.now() - start, "ms");
