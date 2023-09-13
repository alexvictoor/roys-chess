import { BitBoard, fromUciNotation } from "./bitboard";
import { parseFEN } from "./fen-parser";

export function findMoveInOpeningBook(
  openingBookData: StaticArray<u32>,
  board: BitBoard
): u32 {
  const currentHash = board.hashCode();
  const currentPly = board.hashHistory.length;
  const numberOfPlyInBook = <i32>openingBookData[0];
  if (numberOfPlyInBook <= currentPly) {
    return 0;
  }
  let offset = <i32>openingBookData[currentPly + 1];
  const maxOffset =
    currentPly === numberOfPlyInBook - 1
      ? <i32>openingBookData.length
      : <i32>openingBookData[currentPly + 2];
  while (offset < maxOffset) {
    const hash = <u64>openingBookData[offset] + ((<u64>openingBookData[offset + 1]) << 32);
    const numberOfMoves = <i32>openingBookData[offset + 2];
    if (hash === currentHash) {
      
      return <u32>openingBookData[offset + 2 + <i32>Math.ceil(Math.random() * numberOfMoves)];
    }
    offset = offset + 2 + numberOfMoves + 1;
  }
  return 0;
}

export function generateOpeningBookSourceCode(
  openingBookData: StaticArray<u32>
): string {
  return `
  // ${openingBookData.length * 4 / 1024}Kb
  export const openingBookData = StaticArray.fromArray<u32>([${openingBookData.join(
    ", "
  )}]);`;
}
export function generateOpeningBookData(input: string): StaticArray<u32> {
  const data: Array<Map<u64, Array<u32>>> = [];

  for (let index = 0; index < 40; index++) {
    data.push(new Map<u64, Array<u32>>());
  }

  const initialBoardFen =
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  const board = parseFEN(initialBoardFen);

  const lines = input.split("\n");
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const cells = line.split("\t");
    if (cells.length > 4 && cells[3] != "uci") {
      const moveNotations = cells[3].split(" ");
      for (let index = 0; index < moveNotations.length; index++) {
        const move = fromUciNotation(moveNotations[index], board);
        const currentBoardHash = board.hashCode();
        if (!data[index].has(currentBoardHash)) {
          data[index].set(currentBoardHash, []);
        }
        const moves = data[index].get(currentBoardHash);
        if (!moves.includes(move)) {
          moves.push(move);
        }
        board.do(move);
      }
      for (let index = 0; index < moveNotations.length; index++) {
        board.undo();
      }
    }
  }

  const result: Array<u32> = [];
  const numberOfPly = data.findIndex((positions) => positions.size === 0);
  // 0 nb de niveaux (8)
  result.push(numberOfPly);
  // 1-22 offset niveaux
  let offset: u32 = numberOfPly + 1;
  for (let index = 0; index < numberOfPly; index++) {
    result.push(offset);
    const positions = data[index];
    const numberOfMovesForAllPositions = positions.values().map<i32>(ar => ar.length).reduce((acc, l) => acc + l, 0);
    offset += positions.size * 3 + numberOfMovesForAllPositions;
  }
  for (let ply = 0; ply < numberOfPly; ply++) {

    const positions = data[ply];
    const hashes = positions.keys();
    for (let hashIndex = 0; hashIndex < hashes.length; hashIndex++) {
      const hash = hashes[hashIndex];
      const hashFirstPart = <u32>(hash & 0xFFFFFFFF)
      const hashSecondPart = <u32>(hash >> 32)
      result.push(hashFirstPart);
      result.push(hashSecondPart);
      const moves = positions.get(hash);
      result.push(moves.length);
      for (let moveIndex = 0; moveIndex < moves.length; moveIndex++) {
        const move = moves[moveIndex];
        result.push(move);
      }
    }
  }
  // 9-... hash -  offset next hash - coups possibles
  return StaticArray.fromArray(result);
}
