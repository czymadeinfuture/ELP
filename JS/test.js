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

class GameBoard {
    constructor(rows, columns) { 
        this.rows = rows;
        this.columns = columns;
        this.board = this.initializeBoard();
        this.scores = [9,16,25,36,49,64,81]; // 假设的分数
    }

    initializeBoard() {
        return new Array(this.rows).fill(null).map(() => new Array(this.columns).fill(''));
    }

    // 假设word是一个字符串数组，wordIndex是单词开始的列索引
    placeWord(word, row, wordIndex = 0) {
        if (wordIndex + word.length > this.columns) {
            throw new Error('单词超出游戏板范围');
        }
        for (let i = 0; i < word.length; i++) {
            this.board[row][wordIndex + i] = word[i];
        }
    }

    printBoard() {
        let scoresRow = '        '; 
        this.scores.forEach((score, index) => {
            const scoreStr = score.toString();
            // 格子宽度是3，分数应该放在格子的中间，所以使用 padStart
            scoresRow += scoreStr.padStart(Math.floor((3 - scoreStr.length) / 2) + 3);
            scoresRow += ' '; // 分数之间添加3个空格
        });
        console.log(scoresRow);

        // Print the game board with proper spacing and borderss
        this.board.forEach((row, index) => {
            const rowString = row.map(cell => `[${cell.padEnd(1)}]`).join(' ');
            console.log((index + 1).toString().padStart(1) + rowString); // Add row numbers
        });
    }
}

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));


class Game {
    constructor(numberOfPlayers) {
        this.initializeGame(numberOfPlayers);
        this.finish_game = false;
    }

    initializeGame(numberOfPlayers) {
        this.letterBag = new LetterBag();
        this.players = new Array(numberOfPlayers).fill(null).map(() => ({
            hand: [],
            gameBoard: new GameBoard(7,9)// 
        }));
        
        for (let i = 0; i < this.players.length; i++) {
            for (let j = 0; j < 6; j++) { // init the 6 letters for each player
                this.players[i].hand.push(this.letterBag.drawLetter());
            }
        }
    }

    async player_round(playerIndex){
        console.log(`Player ${playerIndex+1}'s turn start!`);
        this.printPlayerHand(playerIndex);
        this.printPlayerGameBoard(playerIndex);
        await this.playeraction(playerIndex);
        console.log(`Player ${playerIndex+1}'s turn finish!`);
    }

    async playeraction(playerIndex){
        let inputsucess=false;
        while (!inputsucess) {
            const input = await question('1: make a new word. 2: change your word from board. 3: end your turn and pass to next player. 4: Do a Jarnac! -- Choose an action:');
            switch(input) {
                case '1':
                    await this.placeWord(playerIndex)
                    break;
                case '2':
                    
                    await this.changeWord(playerIndex);
                    break;
                   
                case '3':
                    inputsucess = true;
                    continue;
                case '4':
                    await this.Jarnac(playerIndex);
                    break;
                default:
                    console.log('Invalid Input!');
                
                
            };
        }
    }

    async changeWord(playerIndex){


    }

    async placeWord(playerIndex) {
        let isValidWord = false;
        while (!isValidWord) {
            try {
                const player = this.players[playerIndex];
                const word = await question('Enter a word/letter from your hand: ');
                
                // make sure the word has at least three letters
                if (word.length < 3) {
                    console.log('The word must be at least 3 letters long.');
                    continue;
                }

                // make sure the letters are in the player's hand
                if (!this.isWordInHand(word, playerIndex)) {
                    console.log('You do not have these letters in your hand.');
                    continue;
                }

                const row = await question('Enter the row number to place the beginning of the word: ');
                const col = await question('Enter the column number to start the word: ');

                // place the word and show the board
                player.gameBoard.placeWord(word.toUpperCase().split(''), parseInt(row) - 1, parseInt(col) - 1);
                player.gameBoard.printBoard();

                this.removeletters(word, playerIndex);

                isValidWord = true; 

            } catch (error) {
                console.error('An error occurred:', error);
                isValidWord = false; 
            }
            
        }
        
    }

    isWordInHand(word, playerIndex) {
        let handCopy = this.players[playerIndex].hand.slice();
        for (let char of word.toUpperCase()) {
            const charIndex = handCopy.indexOf(char);
            if (charIndex === -1) {
                return false;
            }
            handCopy.splice(charIndex, 1);
        }
        return true;
    }

    drawCard(playerIndex) {
        try {
            const newLetter = this.letterBag.drawLetter();
            this.players[playerIndex].hand.push(newLetter);
            console.log(`Player ${playerIndex + 1} draws a new letter: ${newLetter}`);
        } catch (error) {
            console.error('Error drawing a new letter:', error.message);
        }
    }

    removeletters(word, playerIndex) {
        for (let letter of word.toUpperCase()) {
            const index = this.players[playerIndex].hand.indexOf(letter);
            if (index !== -1) {
                this.players[playerIndex].hand.splice(index, 1); // Remove the letter
            }
        }
    }

    async Jarnac(){

    }


    getPlayerHand(playerIndex) {
        return this.players[playerIndex].hand;
    }

    getPlayerGameBoard(playerIndex) {
        return this.players[playerIndex].gameBoard;
    }

    printPlayerHand(playerIndex) {
        console.log(`Player ${playerIndex + 1} hand: ${this.getPlayerHand(playerIndex).join(', ')}`);
    }

    
    printPlayerGameBoard(playerIndex) {
        const gameBoard = this.getPlayerGameBoard(playerIndex);
        console.log(`Player ${playerIndex + 1} Board: `);
        gameBoard.printBoard();
        
    }

    
    printPlayersWordPool() {
        for (let i = 0; i < this.players.length; i++) {
            this.printPlayerHand(i);
            this.printPlayerGameBoard(i);
        }
    }

    is_game_finished(){
        
    }

    async run(){
        
        
        await this.player_round(0);
            //this.calculate_point();
            
        this.is_game_finished();
        rl.close()
            
                
            
        
    }

    /*async run() {
        // Display initial hands
       
        this.printPlayerHand(0);
        this.printPlayerGameBoard(0);
        await this.placeWord(0);
        this.drawCard(0);

        this.printPlayerHand(0);
        await this.placeWord(0);
        rl.close();

        
    }*/
}


(async () => {
    const game = new Game(2);
    game.run();// 玩家一放置单词
})();
