// Standard perft positions (chessprogramming.org/Perft_Results) with known node counts.
const PERFT = [
  { name: "start", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", depths: { 1: 20, 2: 400, 3: 8902, 4: 197281, 5: 4865609 } },
  { name: "kiwipete", fen: "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1", depths: { 1: 48, 2: 2039, 3: 97862, 4: 4085603 } },
  { name: "pos3", fen: "8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1", depths: { 1: 14, 2: 191, 3: 2812, 4: 43238, 5: 674624 } },
  { name: "pos4", fen: "r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1", depths: { 1: 6, 2: 264, 3: 9467, 4: 422333 } },
  { name: "pos4-mirror", fen: "r2q1rk1/pP1p2pp/Q4n2/bbp1p3/Np6/1B3NBn/pPPP1PPP/R3K2R b KQ - 0 1", depths: { 1: 6, 2: 264, 3: 9467, 4: 422333 } },
  { name: "pos5", fen: "rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8", depths: { 1: 44, 2: 1486, 3: 62379, 4: 2103487 } },
  { name: "pos6", fen: "r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10", depths: { 1: 46, 2: 2079, 3: 89890, 4: 3894594 } },
];

// Middlegame / endgame positions used for speed and move-quality benchmarks.
// Mix of tactical (WAC-style) and quiet positions; none are in the opening book.
const BENCH = [
  { name: "wac001", fen: "2rr3k/pp3pp1/1nnqbN1p/3pN3/2pP4/2P3Q1/PPB4P/R4RK1 w - - 0 1" },
  { name: "wac002", fen: "8/7p/5k2/5p2/p1p2P2/Pr1pPK2/1P1R3P/8 b - - 0 1" },
  { name: "wac003", fen: "5rk1/1ppb3p/p1pb4/6q1/3P1p1r/2P1R2P/PP1BQ1P1/5RKN w - - 0 1" },
  { name: "wac004", fen: "r1bq2rk/pp3pbp/2p1p1pQ/7P/3P4/2PB1N2/PP3PPR/2KR4 w - - 0 1" },
  { name: "wac005", fen: "5k2/6pp/p1qN4/1p1p4/3P4/2PKP2Q/PP3r2/3R4 b - - 0 1" },
  { name: "wac007", fen: "rnbqkb1r/pppp1ppp/8/4P3/6n1/7P/PPPNPPP1/R1BQKBNR b KQkq - 0 1" },
  { name: "wac008", fen: "r4q1k/p2bR1rp/2p2Q1N/5p2/5p2/2P5/PP3PPP/R5K1 w - - 0 1" },
  { name: "wac010", fen: "3q1rk1/p4pp1/2pb3p/3p4/6Pr/1PNQ4/P1PB1PP1/4RRK1 b - - 0 1" },
  { name: "wac012", fen: "4k1r1/2p3r1/1pR1p3/3pP2p/3P2qP/P4N2/1PQ4P/5R1K b - - 0 1" },
  { name: "wac014", fen: "r2rb1k1/pp1q1p2/2b1p1p1/2p1P2p/2P4P/1P1B1NB1/PP1Q1PP1/2R2R1K w - - 0 1" },
  { name: "wac016", fen: "r4rk1/ppp2ppp/2n5/2bqp3/8/P2PB3/1PP1NPPP/R2Q1RK1 w - - 0 1" },
  { name: "wac020", fen: "r1bqk2r/pp3ppp/2n1p3/8/1bBP4/2N5/PP3PPP/R2QK1NR w KQkq - 0 1" },
  { name: "quiet01", fen: "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PPQ1BPPP/R1B2RK1 w - - 0 8" },
  { name: "quiet02", fen: "r2q1rk1/1b1nbppp/pp1ppn2/8/2PNP3/1PN1B3/P3BPPP/R2Q1RK1 w - - 0 12" },
  { name: "quiet03", fen: "2r2rk1/pp1bqppp/2n1pn2/3p4/3P4/2PBPN2/PQ3PPP/R4RK1 b - - 0 13" },
  { name: "quiet04", fen: "r1bqr1k1/pp3pbp/2np1np1/2p1p3/2P1P3/2NP1NP1/PP2QPBP/R1B1R1K1 w - - 0 10" },
  { name: "endg01", fen: "8/8/4k3/3p4/3P4/4K3/8/8 w - - 0 1" },
  { name: "endg02", fen: "8/5pk1/6p1/8/5PP1/6K1/8/8 w - - 0 1" },
  { name: "endg03", fen: "8/8/1p3k2/p1p5/P1P5/1P3K2/8/8 w - - 0 1" },
  { name: "endg04", fen: "8/3k4/8/3P4/3K4/8/8/8 w - - 0 1" },
  { name: "endg05", fen: "3r2k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1" },
  { name: "endg06", fen: "6k1/5ppp/8/8/8/8/1R3PPP/6K1 w - - 0 1" },
  { name: "tact01", fen: "r1b1kb1r/pppp1ppp/5q2/4n3/3KP3/2N3PN/PPP4P/R1BQ1B1R b kq - 0 1" },
  { name: "tact02", fen: "1rb4r/pkPp3p/1b1P3n/1Q6/N3Pp2/8/P1P3PP/7K w - - 0 1" },
  { name: "tact03", fen: "4kb1r/p2n1ppp/4q3/4p1B1/4P3/1Q6/PPP2PPP/2KR4 w k - 0 1" },
  { name: "tact04", fen: "r1b2rk1/2q1b1pp/p2ppn2/1p6/3QP3/1BN1B3/PPP3PP/R4RK1 w - - 0 1" },
  { name: "tact05", fen: "6k1/pp4p1/2p5/2bp4/8/P5Pb/1P3rrP/2BRRN1K b - - 0 1" },
  { name: "tact06", fen: "r2qkb1r/pp2nppp/3p4/2pNN1B1/2BnP3/3P4/PPP2PPP/R2bK2R w KQkq - 0 1" },
  { name: "tact07", fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1" },
  { name: "tact08", fen: "3r1k2/4npp1/1ppr3p/p6P/P2PPPP1/1NR5/5K2/2R5 w - - 0 1" },
];

module.exports = { PERFT, BENCH };
