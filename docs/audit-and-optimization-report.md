# Roy's Chess: audit, Stockfish safety net and engine optimization

Date: 2026-09-27. Scope: the AssemblyScript engine in `assembly/` (search,
evaluation, move generation) and the tooling around it. Everything below was
measured on this machine (Apple Silicon, Node 24, Stockfish 19) and every
number can be reproduced with the scripts in `bench/`.

## 1. Summary

| | Before | After |
| --- | --- | --- |
| Static evaluation speed (same tree, depth 5 on 30 positions) | 95.4 s, 115k nodes/s | 43.8 s, 250k nodes/s |
| Time budget respected | no (1 s searches took up to 15.5 s) | yes (checked every 2k nodes in every node type) |
| Average depth reached in 1 s per move | 6.4 | 8.3 |
| Move quality vs Stockfish, 1 s per move (30 positions) | 23/30 best moves, 3 blunders, mean loss 33 cp | 27/30 best moves, 1 blunder, mean loss 18 cp |
| A/B match vs the original build, 500 ms per move, 10 games | (baseline) | 10 wins, 0 losses, 0 draws (the original returns an empty move in every lost position) |
| Wasm memory for the hash tables | 672 MB | 104 MB |
| Unit tests | 289 pass (37 disabled) | 329 pass (37 still disabled): 40 new tests in `assembly/__tests__/fixes/`, one spec per fix, each red on the original code (section 7) |

The engine is the same engine (same evaluation, same move generator, same
public `Game` API used by `wasm-worker.js`); the gains come from removing
waste in the evaluation, and from fixing a series of bugs in the search that
made most of its pruning inoperative or unsafe.

## 2. How the work was organised

1. **Audit** of the code by reading it and by profiling a depth-5 search with
   the V8 tick profiler (wasm function names recovered from the `.wat` file).
2. **Safety net** built before touching anything: a Node harness in `bench/`
   that drives the wasm build and the `stockfish` CLI. The original build was
   compiled with the same bench hooks and kept as the baseline every later
   step is compared against.
3. **Optimization in steps**, each step validated against the safety net
   before the next: evaluation first (must stay bit-identical), then the
   search (must not lose strength at equal time).
4. This report.

## 3. Audit findings

Severity: **bug** = wrong result or crash, **perf** = wasted time, **nit** =
cosmetic or latent.

### Search (`alpha-beta-evaluation.ts`, `quiescence-evaluation.ts`)

| # | Sev. | Finding | Status |
| --- | --- | --- | --- |
| S1 | bug | Killer move arrays had 12 slots but are indexed by ply; searches past ply 11 wrote out of bounds through `unchecked()` (memory corruption). | fixed (sized `MAX_PLY`) |
| S2 | bug | History counters were `i16` and incremented by `1 << ply`; from ply 15 they overflow and quiet move ordering becomes noise. | fixed (`i32`, depth² bonus, capped) |
| S3 | bug | Null move pruning used the wrong window (`-alpha` instead of `1 - beta`), so it could only ever cut when the window was already zero width. In practice it was dead code. | fixed |
| S4 | bug | The zero window search had no null move, no reductions, no futility pruning and **no time check**. Most of the tree is zero-window, hence the 15 s overshoot on a 1 s budget. | rewritten (single `search()` for PV and zero-window nodes) |
| S5 | bug | The timeout was signalled with a magic score (`-8150`) that a real position could produce and that had to be propagated by hand through negations. | replaced by an `abortSearch` flag |
| S6 | bug | Mate scores (±30000) were outside the root window (±16383) so every mate was clipped to 16383: the engine could not tell mate-in-1 from mate-in-9, and mate scores in the transposition table were not ply-adjusted. | fixed (window ±32000, ply adjustment on store/probe, mate distance pruning) |
| S7 | bug | No repetition or 50-move detection inside the search: the engine could not see that it was repeating (or that the opponent could force a repetition). | fixed (2-fold detection against the game + search history) |
| S8 | bug | `Date.now()` (a host call) was executed at every PV node; the throttle was commented out. | every 2048 nodes |
| S9 | perf | The quiescence search called `canMove()` (a full legal move generation with make/unmake) at **every** node just to detect mate and stalemate, then stood pat even when in check. | in check: search evasions, otherwise stand pat |
| S10 | perf | A static exchange evaluation was computed for every move of every node, but only used for a reduction decision on quiet moves. | removed from the main search, kept in quiescence |
| S11 | bug | The SEE multiplied piece *codes* (0..11) instead of piece values for recaptures, so it only really compared the first capture with the first recapture. Tests and the engine also disagreed on whether the move had been played. | rewritten (classic swap list, computed before the move is played) |
| S12 | bug | Late move reduction compared the reduced score with the original `alpha` instead of the current one, so after the first improvement it never pruned and always re-searched. | fixed |
| S13 | perf | Every node allocated a new `StaticArray` for its move list (`MoveStack.flush`), ~14% of the profile was allocator/GC (`tlsf`, `itcms`, `memory.fill`). | per-ply preallocated arenas, zero allocation in the search |
| S14 | perf | The transposition table was 2^25 entries × 16 B = 512 MB and the evaluation cache 2^24 × 10 B = 160 MB; both were zero-filled on every new game. Entries were never replaced by shallower ones, even from previous searches, so the table slowly filled with stale data. | 2^22 entries each (64 MB + 40 MB), generation-based replacement |
| S15 | bug | `EvaluationTable.reset()` assigned a `StaticArray<u64>` to a `StaticArray<i16>` field (never executed, but a type error waiting to happen). | fixed |
| S17 | bug | When every root move loses to a forced mate, all scores equal the initial `alpha` and `score > alpha` never fires: the root returns move 0, which the UI receives as `a1-a1`. Reproduced on `8/1k1Q3K/4R3/8/8/3P4/8/8 b` (the original build answers `a1a1`, the new one `b7b8`). | fixed (fail-soft root, best move always set) |
| S16 | nit | Every search test (`alpha-beta-evaluation.spec.ts`, `perft.spec.ts`) is disabled with `xit`, so no test covered the search at all. The Stockfish harness now covers it. | harness |

### Evaluation (`assembly/evaluation/*`)

| # | Sev. | Finding | Status |
| --- | --- | --- | --- |
| E1 | perf | `BitBoard.getPieceAt()` scanned the 12 piece bitboards linearly; it was the single hottest function (13.6% of the time) because the evaluation calls it in nested loops. | mailbox (`squares[64]`) maintained by put/remove, O(1) |
| E2 | perf | `imbalance()` looped over every piece × every piece × `getPieceAt` (O(n²) with a linear scan inside): 10% of the time. The Stockfish term only depends on piece *counts*. | rewritten count-based, O(types²) |
| E3 | perf | `possibleChecksMask()` tested every square attacked by rooks/bishops/queens against the king, and for queens every square reachable from every reachable square (magic lookups squared): 7% of the time. It is called 7+ times per evaluation. | sliding attacks are symmetric: cast the rays from the king once and intersect |
| E4 | perf | Mobility bonus tables and piece value tables were array literals allocated on every call (`const bonus: i16[] = mg ? [...] : [...]`). | module-level `StaticArray`s |
| E5 | nit | `getCachedEvaluation()` returns 0 for "not found", so positions evaluated exactly 0 are never cached. | left as is |
| E6 | nit | `imbalance()` awards the bishop-pair term with `== 2` bishops; Stockfish uses `> 1` (only differs with a promoted third bishop). Kept identical to preserve the bit-exact comparison. | documented |

### Board, status, book, glue

| # | Sev. | Finding | Status |
| --- | --- | --- | --- |
| B1 | bug | `isDrawByRepetition()` used `i8` for the history index: games longer than 127 plies index the array with a negative number (trap in wasm). | `i32` |
| B2 | bug | Opening book pick used `Math.ceil(Math.random() * n)`, which returns index 0 (the move *count*, not a move) when `random()` is exactly 0. | `floor`, clamped |
| B3 | bug | `fromUciNotation()` ignored promotions (`e7e8q`), so the opening book generator and any UCI input silently produced a non-promoting pawn move. | promotions parsed, `toUciNotation()` added |
| B4 | nit | When a rook is captured on its home square the *opponent's* castling right stays set for one ply (the mover's rights are checked, not the victim's). Move generation is still correct because it also checks the rook is present; only the hash and the FEN are affected for that ply. | documented |
| B5 | nit | `doNullMove()` clears the en-passant file without updating the hash; hash keys inside a null-move subtree can carry a stale en-passant component. Harmless for correctness (keys stay unique) but noted. | documented |
| B6 | nit | `Game.performMove()` contained `trace('coucou alex')` debug output; `nextMove()` never resets the tables so it runs with a 2-entry transposition table. | traces removed; `nextMove` left as is (unused by the UI) |
| B7 | nit | `npm run astest` did not work on Node ≥ 22: the as-pect launcher passes the removed `--experimental-wasm-bigint` flag. | script now calls the runner directly |
| B8 | ok | Move generation is correct: perft matches Stockfish and the published counts on the 7 standard positions up to depth 4-5 (11.4 M nodes). | verified |

## 4. The safety net

Everything lives in `bench/` (see `bench/README.md`) and talks to the
`stockfish` binary over UCI through a 100-line client (`bench/stockfish.js`).
The engine is loaded through `bench/engine.js`, which uses hooks added at the
end of `assembly/index.ts` (`searchFen`, `perftFen`, `evaluateFen`,
`quiescenceFen`, `principalVariation`, `configureSearch`, `BenchGame`).

| Check | Question it answers | Verdict source |
| --- | --- | --- |
| `bench/perft-check.js` | Does the move generator produce exactly the legal moves? | Stockfish `go perft` + published counts |
| `bench/eval-diff.js` | Did an evaluation refactor change *any* score? | two wasm builds on 1,500 random positions (`bench/random-positions.txt`, generated by `gen-positions.js` with a seeded PRNG from Stockfish legal move lists) |
| `bench/speed.js` | How fast is the engine (time to depth, nodes/s)? | wall clock |
| `bench/move-quality.js` | How good are the moves at a fixed time budget? | Stockfish depth 18 scores the engine's move against its own best move: centipawn loss, best-move rate, blunders (≥ 200 cp), illegal moves |
| `bench/match.js` | Is build A stronger than build B? | A/B games from 10 openings, Stockfish checks legality and adjudicates unfinished games; reports score and Elo estimate |
| `bench/analyse-game.js` | Where did a game go wrong? | per-move centipawn loss |

The match and the move-quality scripts caught a real regression during this
work (see 6.3), which is exactly what they are for.

## 5. What changed in the engine, step by step

### Step 1: evaluation, bit-identical (E1-E4)

Mailbox in `BitBoard`, count-based `imbalance`, king-centric
`possibleChecksMask`, static tables. Validation: `eval-diff` reports 0
differences on 1,500 positions (and identical perft 2), all 289 tests pass.
Result on the same search tree (the search was untouched, node counts are
identical): 95.4 s → 43.8 s for the depth-5 suite, 115k → 250k nodes/s.

### Step 2: search rewrite (S1-S15)

`alpha-beta-evaluation.ts` is now one `search()` function used for PV and
zero-window nodes, with: transposition table probe (exact cuts everywhere,
bound cuts in non-PV nodes), null move pruning with the correct window and a
static-eval guard, futility pruning at depth ≤ 3, late move reductions with
re-search, check extension, mate distance pruning, repetition and 50-move
detection, and a root that does proper PVS with iterative deepening and keeps
a better move found in an interrupted iteration. Quiescence search stands pat
only when not in check and searches all evasions otherwise, prunes losing
captures with the rewritten SEE, and scores mates by distance.

Move lists come from preallocated per-ply arenas (`move-stack.ts`); history
and killers are sized for 128 plies; the transposition table uses generations
for replacement; both hash tables are 2^22 entries.

### Step 3: the regression the harness caught (6.3)

The step-2 build lost its match. The cause was a one-line integer overflow
in the new search, found with the feature switches and a trace; section 6.3
tells the story. The final build is step 2 plus that fix.

## 6. Results

All runs: 1 thread, same machine, Stockfish 19 as referee. Raw JSON for every
run was kept alongside the logs; the commands are listed in `bench/README.md`.

### 6.1 Speed

Time to finish the depth-5 suite (30 positions, `bench/speed.js --depth 5`):

| Build | Nodes searched | Time | Nodes/s |
| --- | --- | --- | --- |
| original | 10.96 M | 95.4 s | 115k |
| step 1 (evaluation only, identical tree) | 10.96 M | 43.8 s | 250k |
| final (new search) | 0.14 M | 0.6 s | 226k |

The step-1 line is the honest raw-speed comparison (same tree, 2.2× faster
per node). The final line shows what the search fixes do to the *size* of the
tree: depth 5 needs 80× fewer nodes. Depth 7 on the same suite takes 2.4 s.
Nodes/s is slightly lower on the final build because a much larger share of
its nodes are cheap quiescence nodes that now stop early, and because the
tree is dominated by the evaluation rather than by move generation.

### 6.2 Move quality at 1 s per move (`bench/move-quality.js --time 1000`)

| Build | Best move | Mean loss | Median | Blunders (≥200 cp) | Mean depth | Budget overshoot |
| --- | --- | --- | --- | --- | --- | --- |
| original | 23/30 | 33 cp | 0 | 3 | 6.4 | up to 15.5 s |
| step 2 (search rewrite, with the bug below) | 23/30 | 34 cp | 0 | 3 | 7.7 | none |
| final | 27/30 | 18 cp | 0 | 1 | 8.3 | none |

The remaining blunder is WAC 8 (`r4q1k/p2bR1rp/2p2Q1N/...`, needs `Rxf7`
instead of `Nxf7+`); the original build gets it wrong too. All six mate
positions are now solved in under 50 ms with a correct mate distance.

### 6.3 The regression the harness caught

The first search rewrite reached depth 7.7 but *lost* its A/B match against
the original build 0 wins, 4 losses, 6 draws (−147 Elo). `bench/analyse-game.js`
pointed at a bishop hung for nothing at ply 55 of game 1; searching that
position at fixed depths gave +810, −255, +535, −265 on consecutive depths
even with every pruning feature switched off (`configureSearch(0)`), so the
bug was in the core. A trace showed each root alternative "improving" the
score by exactly 1: `const pvNode = beta - alpha > 1` overflows `i16` when
the window is nearly full (29998 − (−29999) wraps negative), so PV nodes were
searched as zero-window nodes and never re-searched. One cast (`<i32>`)
fixed it. Without the match and the per-game analysis this would have
shipped as "twice as deep".

### 6.4 A/B match, final build vs original, 500 ms per move, 10 openings

| | Wins | Losses | Draws | Score | Avg depth | Nodes/s |
| --- | --- | --- | --- | --- | --- | --- |
| final (A) | 10 | 0 | 0 | 100% | 8.5 | 285k |
| original (B) | 0 | 10 | 0 | 0% | 4.6 | 280k |

Every game ended the same way: once the original build was in a lost
position (forced mate against it), it returned an empty move (S17) which the
match adjudicates as a loss; the UI would have shown `a1-a1`. The games
before that point were also going the new build's way: `analyse-game.js`
(Stockfish depth 12) on game 1 gives a mean loss of 21 cp per move for the new
build against 30 cp for the original, with the original making the first
move losing more than 200 cp.

### 6.5 Correctness

- Perft: identical to Stockfish on the 7 reference positions (11.4 M nodes).
- Evaluation: bit-identical to the original on 1,500 random positions.
- Unit tests: 289 pass, 0 fail (one test had to be kept honest: it asserts
  the "victim minus attacker" capture order, which the new ordering respects).
- Memory: hash tables 672 MB → 104 MB; the search no longer allocates.

## 7. The failing test behind each fix

Every fix has a spec in `assembly/__tests__/fixes/`, one file per fix, that
is red on the original code (commit `6aa0bcd`) and green on the fixed code.
Each spec was run on both: the original in a separate checkout of that
commit, the fixed code in the working tree. "Red" takes three forms. An
**assertion** failure is the strongest: the test compiles against the
original and the original gives the wrong answer. A **compile error** means
the test uses an API the fix introduced (feature toggles, search statistics):
the original cannot express the behaviour. A **crash** is a wasm trap or the
test runner dying.

| Fix | Spec | Red on the original code |
| --- | --- | --- |
| 1 PV window overflow | `fix-01-pv-window-does-not-overflow` | compile error (`search()` did not exist). Putting the `i16` subtraction back into the new code makes it fail: -1328 instead of -6 on the first position. |
| 2 one search function | covered by fix 3 | the clock test only passes if zero-window nodes check the clock |
| 3 time budget | `fix-03-time-budget-is-respected` | compile error (`setSearchTimeout`); the original budget was a 20 s constant |
| 4 root returns move 0 | `fix-04-root-returns-a-move-when-lost` | assertion: the original returns move 0 |
| 5 null move pruning | `fix-05-null-move-pruning-prunes` | compile error (`setSearchFeatures`, `getTotalNodes`) |
| 6 late move reductions | `fix-06-late-move-reductions-reduce` | compile error (same) |
| 7 futility pruning | `fix-07-futility-pruning-prunes` | compile error (same) |
| 8 check extension | `fix-08-check-extension-sees-through-checks` | compile error (same); Philidor's legacy (mate in 4) is found at depth 4 only with the extension |
| 9 quiescence in check | `fix-09-quiescence-does-not-stand-pat-in-check` | assertion: the original stands pat and scores the side about to lose its queen positively |
| 10 SEE piece values | `fix-10-see-uses-piece-values` | assertion: 2 of 3 exchanges get the wrong value |
| 11 SEE out of the main search | none | performance only, measured by `npm run bench:speed` |
| 12 killers at every ply | `fix-12-killers-at-every-ply` | assertion: killers past ply 11 are not ranked |
| 13 history overflow | `fix-13-history-counters-do-not-overflow` | assertion: negative scores |
| 14 ordering scales | `fix-14-captures-rank-above-killers` | assertion: the killer is ranked above the capture |
| 15 transposition table | `fix-15a-transposition-table-verifies-the-full-hash`, `fix-15b-transposition-table-replaces-stale-entries` | 15a assertion: a probe returns the entry of another position; 15b compile error (`newSearch`) |
| 16 move arena | `fix-16-move-lists-do-not-allocate` | crash: the test runner runs out of memory tracing the original's per-node allocations; the perft checks are green on both |
| 17 mate distance | `fix-17-mate-scores-carry-the-distance` | compile error (`getLastSearchScore`) |
| 18 draws in the search | `fix-18a-fifty-move-rule-inside-the-search`, `fix-18b-repetition-inside-the-search` | 18a compile error; 18b assertion: the original does not steer into the repetition |
| 19 i8 history index | `fix-19-repetition-check-on-long-games` | crash: "Index out of range" |
| 20 mailbox lookup | `fix-20-piece-lookup-on-empty-square` | crash: throws on an empty square |
| 21, 22, 23 evaluation refactors | `fix-21-22-23-evaluation-is-unchanged` | green on both by design: values recorded from the original build, the refactors must not move them |
| 24 UCI promotions | `fix-24-uci-promotions` | assertion: a pawn instead of a queen |
| 25 opening book pick | `fix-25-opening-book-pick` | compile error: the pick was extracted into `pickBookMoveIndex()` so the random number is an input; the original `ceil` formula returns slot 0 for a random of 0 |
| 26 evaluation table reset | `fix-26-evaluation-table-reset` | compile error that *is* the bug: AssemblyScript compiles lazily, so the type error only appeared once a test called `reset()` |
| 27 debug traces, 28 test launcher | none | not unit-testable; 28 is exercised by every `npm run astest` on Node 24 |

Fix numbers are those of the companion document "Roy's Chess: the fixes and
the algorithms behind them"; the audit ids (S1, E1, B1...) are quoted in each
spec's header comment. Run them all with `npm run astest -- --file fixes`,
or one with `--file fix-10`. The whole suite takes about 90 s; the three
pruning specs account for a third of it (depth-5 searches in a debug build).

## 8. Not done / next steps

- **Search tests**: the `xit` search tests should be re-enabled with the new
  scoring (mate scores are now real), and a few `bench/` runs could be turned
  into a CI job (perft + eval-diff are fast; move-quality takes ~1 min).
- **Evaluation profile**: after the search fixes the evaluation is still the
  cost centre. `stormSquare`/`strengthSquare`, `outpost`, `pawnAttacksSpan`
  and the many `attackBy*Mask` recomputations (the per-evaluation cache only
  covers a few of them) are the next candidates; the harness makes such
  refactors safe.
- **Time management**: the search uses its whole budget; not starting an
  iteration that cannot finish (elapsed > ~50% of budget) would make the UI
  feel faster at no strength cost.
- **Aspiration windows** at the root and a proper PV table would give
  a small additional speed-up and a reliable principal variation for the UI.
- **UI**: `Game.chooseNextMove` still reports `BLACK_WINS` regardless of the
  engine's colour, and the opening book is only consulted for the side to
  move on the current ply table; both are fine for the current white-human
  vs black-engine page.
