importScripts(
  "https://cdn.jsdelivr.net/npm/@assemblyscript/loader/umd/index.js"
);

const BLACK = 1;

let aiGame;
let wasm;
const setup = async () => {
  wasm = await loader.instantiate(fetch("build/optimized.wasm"));
  //const initWasm = async () => await loader.instantiate(fetch("optimized.wasm"));
  aiGame = new wasm.exports.Game();
  postMessage("READY");
};
setup();

onmessage = function (e) {
  if (e.data === "undo") {
    const fenAfterUndo = wasm.exports.__getString(aiGame.undo());
    console.log({ fenAfterUndo });
    return;
  }
  if (e.data.startsWith && e.data.startsWith("fen ")) {
    console.log(e.data.substring(4));
    aiGame.startFrom(wasm.exports.__newString(e.data.substring(4)));
    return;
  }

  const moveOutcome = wasm.exports.__getString(aiGame.performMove(e.data));

  console.log({ moveOutcome });

  if (moveOutcome === "CHECK_MATE") {
    postMessage('{ "endGame": "WHITE_WINS" }');
    return;
  }
  if (moveOutcome === "DRAW") {
    postMessage('{ "endGame": "DRAW" }');
    return;
  }
  const computerMoveOutcome = wasm.exports.__getString(
    aiGame.chooseNextMove(BLACK)
  );
  const analysis = wasm.exports.__getString(aiGame.analyse());
  console.log({ computerMoveOutcome, analysis });
  /*if (computerMoveOutcome.start === "CHECK_MATE") {
    postMessage("BLACK_WINS");
    return;
  }
  if (computerMoveOutcome === "DRAW") {
    postMessage("DRAW");
    return;
  }

  postMessage(computerMoveOutcome.split(" ")[0]);*/
  postMessage(computerMoveOutcome);
};
