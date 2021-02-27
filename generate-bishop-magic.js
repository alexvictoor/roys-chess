const fs = require("fs");
const loader = require("@assemblyscript/loader");

const wasm = loader.instantiateSync(
  fs.readFileSync(__dirname + "/build/optimized.wasm"),
  {
    /* imports */
  }
);
const magicNumbers = wasm.exports.__getString(
  wasm.exports.findBishopMagicNumbers()
);
process.stdout.write(
  `export const bishopMagicNumbers: u64[] = [ ${magicNumbers} ];`
);
