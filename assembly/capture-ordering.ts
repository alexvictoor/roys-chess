import { MoveStack } from "./move-stack";
import { sortCaptures as sortCapturesInPlace } from "./move-ordering";

const stack = new MoveStack();

/** Sort a capture list (allocating API kept for tests). */
export function sortCaptures(captures: StaticArray<u32>): void {
  stack.clear();
  for (let index = 0; index < captures.length; index++) {
    stack.push(unchecked(captures[index]));
  }
  sortCapturesInPlace(stack);
  for (let index = 0; index < captures.length; index++) {
    unchecked((captures[index] = stack.at(index)));
  }
  stack.clear();
}
