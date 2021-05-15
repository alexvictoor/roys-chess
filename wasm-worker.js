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
    const fenAfterUndo = wasm.exports.__getString(iaGame.undo());
    console.log({ fenAfterUndo });
    return;
  }
  if (e.data.startsWith && e.data.startsWith("fen ")) {
    console.log(e.data.substring(4));
    iaGame.startFrom(wasm.exports.__newString(e.data.substring(4)));
    return;
  }

  const moveOutcome = wasm.exports.__getString(iaGame.performMove(e.data));
  console.log({ moveOutcome });
  if (moveOutcome === "CHECK_MATE") {
    postMessage("WHITE_WINS");
    return;
  }
  if (moveOutcome === "DRAW") {
    postMessage("DRAW");
    return;
  }
  const computerMoveOutcome = wasm.exports.__getString(
    iaGame.chooseNextMove(BLACK)
  );
  console.log({ computerMoveOutcome });
  if (computerMoveOutcome === "CHECK_MATE") {
    postMessage("BLACK_WINS");
    return;
  }
  if (computerMoveOutcome === "DRAW") {
    postMessage("DRAW");
    return;
  }

  postMessage(computerMoveOutcome.split(" ")[0]);
};
