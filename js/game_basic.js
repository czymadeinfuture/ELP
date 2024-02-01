class LetterBag {
    constructor() {
        this.letters = [];
        for (let ch = 'A'.charCodeAt(0); ch <= 'Z'.charCodeAt(0); ch++) {
            const count = this.getLetterCount(String.fromCharCode(ch));
            for (let i = 0; i < count; i++) {
                this.letters.push(String.fromCharCode(ch));
            }
        }
        this.shuffleLetters();
    }

    getLetterCount(letter) {
        const counts = { 'A': 14, 'B': 4, 'C': 7, 'D': 5, 'E': 19, 'F': 2, 'G': 4, 'H': 2, 'I': 11, 'J': 1, 'K': 1, 'L': 6, 'M': 5, 'N': 9, 'O': 8, 'P': 4, 'Q': 1, 'R': 10, 'S': 7, 'T': 9, 'U': 8, 'V': 2, 'W': 1, 'X': 1, 'Y': 1, 'Z': 2 };
        return counts[letter] || 0;
    }

    shuffleLetters() {
        for (let i = this.letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.letters[i], this.letters[j]] = [this.letters[j], this.letters[i]];
        }
    }

    drawLetter() {
        if (this.letters.length > 0) {
            return this.letters.shift();
        } else {
            throw new Error("Letter bag is empty");
        }
    }
}

class Game {
    constructor(numberOfPlayers) {
        this.initializeGame(numberOfPlayers);
    }

    initializeGame(numberOfPlayers) {
        this.letterBag = new LetterBag();
        this.playersHands = new Array(numberOfPlayers).fill(null).map(() => []);
        this.playersWordPools = new Array(numberOfPlayers).fill(null).map(() => []);
        for (let i = 0; i < this.playersHands.length; i++) {
            for (let j = 0; j < 6; j++) {
                this.playersHands[i].push(this.letterBag.drawLetter());
            }
        }
    }

    getPlayerHand(playerIndex) {
        return this.playersHands[playerIndex];
    }

    getPlayerWordPool(playerIndex) {
        return this.playersWordPools[playerIndex];
    }

    printPlayerHand(playerIndex) {
        console.log(`Player ${playerIndex} hand: ${this.getPlayerHand(playerIndex).join(', ')}`);
    }

    printPlayersWordPool() {
        for (let i = 0; i < this.playersHands.length; i++) {
            console.log(`Player ${i} Wordpool: ${this.getPlayerWordPool(i).join(', ')}`);
        }
    }
}

// 使用示例
numberOfPlayers=2
const game = new Game(numberOfPlayers);
game.printPlayerHand(0);
game.printPlayerHand(1);
game.printPlayersWordPool();
