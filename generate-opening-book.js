const fs = require("fs");
const loader = require("@assemblyscript/loader");
const wasm = loader.instantiateSync(
  fs.readFileSync(__dirname + "/build/untouched.wasm"),
  {
    /*imports: {
        env: {
          memory: new WebAssembly.Memory({
            initial: 1000,
            maximum: 65536
          })
        }
      }*/
  }
);

const content = ["a", "b", "c", "d", "e"]
  .map((name) =>
    fs.readFileSync(`${__dirname}/lichess-openings/${name}.tsv`, "utf-8")
  )
  .reduce((acc, file) => acc + file, "");

const output = wasm.exports.__getString(
  wasm.exports.generateOpeningBook(wasm.exports.__newString(content))
);
//console.log("coucou", output);

process.stdout.write(output);
