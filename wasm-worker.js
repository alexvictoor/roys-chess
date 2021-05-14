importScripts(
  "https://cdn.jsdelivr.net/npm/@assemblyscript/loader/umd/index.js"
);

const BLACK = 1;

let iaGame;
let wasm;
const setup = async () => {
  wasm = await loader.instantiate(fetch("build/optimized.wasm"));
  //const initWasm = async () => await loader.instantiate(fetch("build/optimized.wasm"));
  iaGame = new wasm.exports.Game();
  postMessage("READY");
};
setup();

onmessage = function (e) {
  if (e.data === "undo") {
    iaGame.undo();
    return;
  }

  iaGame.performMove(e.data);
  const move = wasm.exports.__getString(iaGame.chooseNextMove(BLACK));
  console.log({ move });

  postMessage(move.split(" ")[0]);
};
