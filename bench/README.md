# Evaluation safety net (Stockfish based)

All scripts run under Node and drive the compiled engine (`build/optimized.wasm`
by default, or any build passed with `--wasm`/`--a`/`--b`) against the
`stockfish` CLI (`brew install stockfish`, or set `STOCKFISH=/path/to/binary`).

| Script | What it checks | Typical use |
| --- | --- | --- |
| `npm run bench:perft` | Move generation: engine perft vs Stockfish `go perft` and the published node counts for the 7 standard positions | after touching move generation / make-unmake |
| `npm run bench:eval-diff -- --a build/optimized.wasm --b old.wasm --perft 2` | Two builds must give bit-identical static evaluations (and perft) on 1,500 random positions (`bench/random-positions.txt`) | after refactoring the evaluation |
| `npm run bench:speed -- --depth 6` | Time-to-depth, nodes and nodes/sec on 30 fixed positions | raw speed changes |
| `npm run bench:quality -- --time 1000` | The engine picks a move in a fixed time; Stockfish (depth 18) scores it against its own best move: centipawn loss, best-move rate, blunders, illegal moves | strength at a fixed time budget |
| `npm run bench:match -- --a new.wasm --b old.wasm --time 500 --games 10` | A/B games between two builds from 10 openings (Stockfish checks legality and adjudicates unfinished games) | final go / no-go for a search change |
| `npm run bench:gen-positions` | Regenerates the random position set (seeded, deterministic) | only if the set must change |

Every script accepts `--json out.json` to keep the raw numbers.

The wasm exports used by the harness are defined at the end of
`assembly/index.ts` (`searchFen`, `perftFen`, `evaluateFen`, `BenchGame`).
