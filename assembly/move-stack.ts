export class MoveStack {
    moves: StaticArray<u32>;
    count: i8;

    constructor() {
        this.moves = new StaticArray<u32>(118)
        this.count = 0;
    }

    push(move: u32): void {
        unchecked(this.moves[this.count++] = move);
    }

    flush(): StaticArray<u32> {
        const result =  unchecked(StaticArray.slice(this.moves, 0, this.count));
        this.count = 0;
        return result;
    }

}