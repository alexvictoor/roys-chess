#!/bin/bash
# verify perft numbers (positions from www.chessprogramming.org/Perft_Results)

error()
{
  echo "perft testing failed on line $1"
  exit 1
}
trap 'error ${LINENO}' ERR

echo "perft testing started"

cat << EOF > perft.exp
   set timeout 10
   lassign \$argv pos depth result
   spawn stockfish
   send "position \$pos\\ngo perft \$depth\\n"
   expect "Nodes searched? \$result" {} timeout {exit 1}
   send "quit\\n"
   expect eof
EOF

expect perft.exp "fen 8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - " 2 191 

rm perft.exp

