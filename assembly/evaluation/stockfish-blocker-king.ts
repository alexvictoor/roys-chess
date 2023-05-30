import {
    BitBoard, MaskIterator, opponent
} from "../bitboard";
import {
    bishopMoves,
    queenMoves,
    rookMoves
} from "../sliding-pieces-move-generation";
import { BLOCKERS_FOR_KING_MASK_KEY, getValueFromCacheU64, isInCache, setValueInCacheU64 } from "./stockfish-cache";
import { pinnedDirectionMask } from "./stockfish-pinned-direction";

const positions = new MaskIterator();
  
export function blockersForKingMask(board: BitBoard, player: i8): u64 {

    if (isInCache(BLOCKERS_FOR_KING_MASK_KEY, player)) {
      return getValueFromCacheU64(BLOCKERS_FOR_KING_MASK_KEY, player);
    }

    const opponentPlayer = opponent(player);
    const opponentKingMask = board.getKingMask(opponentPlayer);
    const opponentKingPos = <i8>ctz(opponentKingMask);
    const potentialBlockersMask =
      queenMoves(board.getAllPiecesMask(), opponentKingPos) &
      board.getAllPiecesMask();
    const allPiecesMaskButPotentialBlockers =
      potentialBlockersMask ^ board.getAllPiecesMask();
  
    let blockers: u64 = 0;
  
    const queenMask = board.getQueenMask(player);
    positions.reset(queenMask);
    while (positions.hasNext()) {
      const pos = positions.next();
      const directionMask = pinnedDirectionMask(opponentKingPos, pos);
      //log(maskString(directionMask));
      const moves = queenMoves(allPiecesMaskButPotentialBlockers, pos);
      //log(maskString(moves));
      //log(maskString(potentialBlockersMask));
      //log(maskString(opponentKingMask));
      if (moves & opponentKingMask) {
        blockers |= moves & potentialBlockersMask & directionMask;
      }
    }
    const rookMask = board.getRookMask(player);
    positions.reset(rookMask);
    while (positions.hasNext()) {
      const pos = positions.next();
      const directionMask = pinnedDirectionMask(opponentKingPos, pos);
      const moves = rookMoves(allPiecesMaskButPotentialBlockers, pos);
      if (moves & opponentKingMask) {
        blockers |= moves & potentialBlockersMask & directionMask;
      }
    }
    const bishopMask = board.getBishopMask(player);
    positions.reset(bishopMask);
    while (positions.hasNext()) {
      const pos = positions.next();
      const directionMask = pinnedDirectionMask(opponentKingPos, pos);
      const moves = bishopMoves(allPiecesMaskButPotentialBlockers, pos);
      if (moves & opponentKingMask) {
        blockers |= moves & potentialBlockersMask & directionMask;
      }
    }

    setValueInCacheU64(BLOCKERS_FOR_KING_MASK_KEY, player, blockers);
  
    return blockers;
  }
  