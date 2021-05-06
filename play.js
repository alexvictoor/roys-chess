const loader = require("@assemblyscript/loader");
const fs = require("fs");

const wasm = loader.instantiateSync(
  fs.readFileSync(__dirname + "/build/optimized.wasm"),
  {
    /* imports */
  }
);

const start = Date.now();

const game = new wasm.exports.Game();

for (let index = 0; index < 10; index++) {
  console.log(wasm.exports.__getString(game.chooseNextMove(0)));
  console.log(wasm.exports.__getString(game.chooseNextMove(1)));
}

console.log(Date.now() - start, "ms");
