import { BitBoard } from "./bitboard";

export const EXACT_SCORE: i8 = 0;
export const ALPHA_SCORE: i8 = 1;
export const BETA_SCORE: i8 = 2;

export class EvaluationTable {
  verificationEntries: StaticArray<u64>;
  evaluationEntries: StaticArray<i16>;
  size: i32;

  constructor(sizeMagnitude: i32 = 24) {
    this.size = 1 << sizeMagnitude;
    this.verificationEntries = new StaticArray<u64>(this.size);
    this.evaluationEntries = new StaticArray<i16>(this.size);
  }

  reset(sizeMagnitude: i32 = 24): void {
    const size: i32 = 1 << sizeMagnitude;
    if (this.size == size) {
      for (let index: i32 = 0; index < size; index++) {
        unchecked((this.verificationEntries[index] = 0));
        unchecked((this.evaluationEntries[index] = 0));
      }
    } else {
      this.size = size;
      this.verificationEntries = new StaticArray<u64>(this.size);
      this.evaluationEntries = new StaticArray<u64>(this.size);
    }
  }

  // r1b1kbnr/ppp2ppp/2n5/3Pp3/7q/3P1Q2/PPP2PPP/RNB1KBNR b
  // r1b1kbnr/ppp2ppp/2n5/3Pp3/7q/3P1Q2/PPP2PPP/RNB1KBNR w

  record(
    board: BitBoard,
    score: i16,
  ): void {
    const hash = board.hashCode();
    /*if (hash == 5048143499609740357) {
      trace(board.toFEN() + ' ' + score.toString());
    }*/
   
    const index: i32 = <i32>(hash & (this.size - 1));
   
    unchecked((this.verificationEntries[index] = hash));
    unchecked(
      this.evaluationEntries[index] = score
    );
  }

  getCachedEvaluation(board: BitBoard): i16 {
    const hash = board.hashCode();

    const index = <i32>(hash & (this.size - 1));
    const verificationEntry = unchecked(this.verificationEntries[index]);
    const hashVerified = verificationEntry == hash;
    if (hashVerified) {
      return unchecked(this.evaluationEntries[index]);
    }
    return 0;
  }
}
