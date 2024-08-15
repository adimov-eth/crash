// src/utils/random.js

export class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }

    static create(seed) {
        return new SeededRandom(seed);
    }

    random() {
        const x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    }
}