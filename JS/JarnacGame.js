class LetterBag {
    constructor() {
        this.letters = [];
        for (let ch = 'A'.charCodeAt(0); ch <= 'Z'.charCodeAt(0); ch++) {
            const count = this.getLetterCount(String.fromCharCode(ch));
            for (let i = 0; i < count; i++) {1
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
        this.scores = [9,16,25,36,49,64,81]; 
    }

    initializeBoard() {
        return new Array(this.rows).fill(null).map(() => new Array(this.columns).fill(''));
    }

    // place the word 
    placeWord(word, row, wordIndex = 0) {
        if (wordIndex + word.length > this.columns) {
            throw new Error('The word is out of range of the board');
        }
        for (let i = 0; i < word.length; i++) {
            this.board[row][wordIndex + i] = word[i];
        }
    }

    printBoard() {
        let scoresRow = '        '; 
        this.scores.forEach((score, index) => {
            const scoreStr = score.toString();
            scoresRow += scoreStr.padStart(Math.floor((3 - scoreStr.length) / 2) + 3);
            scoresRow += ' '; 
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
        this.roundsCompleted = new Array(numberOfPlayers).fill(0);
    }

    initializeGame(numberOfPlayers) {
        this.letterBag = new LetterBag();
        this.players = new Array(numberOfPlayers).fill(null).map(() => ({
            hand: [],
            gameBoard: new GameBoard(8,9)// 
        }));
        
        for (let i = 0; i < this.players.length; i++) {
            for (let j = 0; j < 6; j++) { // init the 6 letters for each player
                this.players[i].hand.push(this.letterBag.drawLetter());
            }
        }
    }
    
    async playeraction(playerIndex){
        let isValidInput=false;
        while (!isValidInput) {
            console.log('\n1: Make a new word(3 letters at least).\n2: Change your word from board.\n3: End your turn and pass to next player.\n4: Do a Jarnac!');
            if (this.roundsCompleted.every(round => round > 0)) {
                console.log('5: Exchange three letters.');
            }
            const input = await question('-- Choose an action (input a number from the options above): ');
            switch(input) {
                case '1':
                    await this.placeWord(playerIndex);
                    break;
                case '2':
                    await this.changeWord(playerIndex);
                    break;
                case '3':
                    isValidInput = true;
                    continue;
                case '4':
                    await this.Jarnac(playerIndex);
                    break;
                case '5':
                    if (this.roundsCompleted.every(round => round > 0)) {
                        await this.exchangeletters(playerIndex);
                    } else {
                        console.log('Option not available yet.');
                    }
                    break;
                default:
                    console.log('Invalid Input!');
                
                
            };
        }
    }

    async changeWord(playerIndex) {
        let isValidInput = false;

        // detect whether the board is empty
        let isBoardEmpty = true;
        for (const row of this.players[playerIndex].gameBoard.board) {
            if (row.some(cell => cell.trim() !== '')) {
                isBoardEmpty = false;
                break;
            }
        }

        if (isBoardEmpty) {
            console.log('The board is empty. No words to modify.');
            return;
        }

        this.printPlayerHand(playerIndex);
    
        while(!isValidInput){
            // enter a letter/several letters from hand
            const letters = await question('Enter a letter or several letters from your hand to add to a word: ');
            if (!this.isWordInHand(letters, playerIndex)) {
                console.log('Invalid input or letters not in hand.');
                continue;
            }
            //  enter a row to modify the word
            let isRowValid = false;
            
            while (!isRowValid) {
                const rowStr = await question('Enter the row number of the word you wish to modify: ');
                const row = parseInt(rowStr) - 1;

                if (isNaN(row) || row < 0 || row >= this.players[playerIndex].gameBoard.rows) {
                    console.log('Invalid row number. Please try again.');
                    continue;
                } else if (this.players[playerIndex].gameBoard.board[row].every(cell => cell.trim() === '')) {
                    console.log('The selected row is empty. No word to modify. Please try again.');
                    continue;
                } else {
                    isRowValid = true; 
                    const originalWord = this.players[playerIndex].gameBoard.board[row].join('').trim();
                    console.log(`Original word in row ${row + 1}: ${originalWord}`);
                            
                    // enter the new word incorporating the chosen letter
                    let isNewWordValid = false;
                    while(!isNewWordValid){
                        const newWord = await question(`Enter a new word incorporating the letter/letters '${letters}': `);
                        const combinedLetters = originalWord.split('').concat(letters.toUpperCase().split('')).sort().join('');
                        const sortedNewWord = newWord.toUpperCase().split('').sort().join('');
                    
                        if (sortedNewWord !== combinedLetters) {
                            console.log(`The new word must use exactly the letters from the original word plus the letter/letters '${letters}', please enter again.`);
                            continue;
                        }
                    
                        this.players[playerIndex].gameBoard.placeWord(newWord.toUpperCase().split(''), row, 0);
                        this.removeletters(letters, playerIndex);
                        this.players[playerIndex].gameBoard.printBoard();
                        this.printPlayerHand(playerIndex);
                        isNewWordValid = true;
                    }
                }
            }
            isValidInput = true;    
        }
        this.drawLetter(playerIndex);
    }

    async placeWord(playerIndex) {
        let isValidWord = false;
        this.printPlayerHand(playerIndex);

        while (!isValidWord) {
            try {
                const player = this.players[playerIndex];
                const word = await question('Enter a word from your hand: ');
                
                // make sure the word has at least three letters
                if (word.length < 3 || word.length > 9) {
                    console.log('The word must be at least 3 letters long and less than 9 letters. ');
                    continue;
                }

                // make sure the letters are in the player's hand
                if (!this.isWordInHand(word, playerIndex)) {
                    console.log('You do not have these letters in your hand.');
                    continue;
                }

                const row = await question('Enter the row number to place the word: ');
                //const col = await question('Enter the column number to start the word: ');

                // examine the input row and column are in the right range
                if (parseInt(row) < 1 || parseInt(row) > 8 ) {
                    console.log('Row numbers must be within the valid range.');
                    continue;
                }
                
                // examine whether the place where you put down a letter is already ocuupied 
                if (player.gameBoard.board[parseInt(row) - 1][0] !== '') {
                    console.log('The selected space is already occupied.');
                    continue;
                }

                // place the word and show the board
                player.gameBoard.placeWord(word.toUpperCase().split(''), parseInt(row) - 1, 0);
                player.gameBoard.printBoard();

                this.removeletters(word, playerIndex);
                
                this.printPlayerHand(playerIndex);
                isValidWord = true; 

            } catch (error) {
                console.error('An error occurred:', error);
            } 
        }
        this.drawLetter(playerIndex);
        
    }

    // examine whether the word is in player's hand
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

    // get a letter from the letter pool
    drawLetter(playerIndex) {
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

    async exchangeletters(playerIndex) {
        let isValidInput = false;
        const player = this.players[playerIndex];
        console.log(`Player ${playerIndex + 1}'s current hand: ${player.hand.join(', ')}`);
        
        while(!isValidInput){
        // 获取玩家想交换的三张牌
            const input = await question('Enter three letters you want to exchange( without the space ): ');

            if (input.length === 3 && [...input.toUpperCase()].every(letter => this.isWordInHand(letter, playerIndex))) {
                [...input.toUpperCase()].forEach(letter => this.removeletters(letter, playerIndex));
                for (let i = 0; i < 3; i++) {
                    this.drawLetter(playerIndex);
                }
                console.log(`Player ${playerIndex + 1}'s new hand: ${player.hand.join(', ')}`);
                isValidInput = true;
            } else {
                console.log('Invalid input or cards not in hand. Please try again.');
            }
        } 
    }


    async Jarnac(playerIndex) {
        const opponentIndex = (playerIndex + 1) % 2; // 假设只有两位玩家
        const opponentHand = this.players[opponentIndex].hand;
        const opponentBoard = this.players[opponentIndex].gameBoard.board;
    
        // check whether the opponent has a letter in his hand
        if (opponentHand.length === 0) {
            console.log("Opponent has no letters in hand.");
            return;
        }
    
        // check the existence of the word on the opponent's board
        let boardHasWord = false;
        for (const row of opponentBoard) {
            if (row.some(cell => cell.trim() !== '')) {
                boardHasWord = true;
                break;
            }
        }
        if (!boardHasWord) {
            console.log("No words on the opponent's board.");
            return;
        }
    
        const letter = await question(`Choose a letter from opponent's hand [${opponentHand.join(', ')}]: `);
        const rowStr = await question("Choose the row number of the word you want to modify on the opponent's board: ");
        const row = parseInt(rowStr) - 1;
    
        if (!opponentHand.includes(letter) || isNaN(row) || row < 0 || row >= this.players[playerIndex].gameBoard.rows) {
            console.log("Invalid input.");
            return;
        }
    
        const newWord = await question(`Enter a new word incorporating the letter '${letter}' and the word from row ${row + 1}: `);
    
        // (tbd:more tests for the validation of the input)
        const newrowStr = await question("Choose the row number in which you want to add the new word on your board: ")
        const newrow = parseInt(newrowStr) - 1;
    
        this.players[playerIndex].gameBoard.placeWord(newWord.toUpperCase().split(''),parseInt(newrow) - 1, 0);
        this.players[opponentIndex].gameBoard.removeWordFromRow(row);
        this.removeletters(letter, opponentIndex); 
    }
    
    removeWordFromRow(row) {
        this.board[row].fill(''); 
    }

    getPlayerHand(playerIndex) {
        return this.players[playerIndex].hand;
    }

    getPlayerGameBoard(playerIndex) {
        return this.players[playerIndex].gameBoard;
    }

    printPlayerHand(playerIndex) {
        console.log(`Player ${playerIndex + 1} current hand: ${this.getPlayerHand(playerIndex).join(', ')}`);
    }

    
    printPlayerGameBoard(playerIndex) {
        const gameBoard = this.getPlayerGameBoard(playerIndex);
        console.log(`Player ${playerIndex + 1} Board: `);
        gameBoard.printBoard();
        
    }

    isGameFinished() {
        for (const player of this.players) {
            let allRowsFilled = true;
            for (let i = 0; i < 7; i++) { // examine the existence of the words in the first 7 rows
                if (player.gameBoard.board[i].every(cell => cell.trim() === '')) {
                    allRowsFilled = false;
                    break;
                }
            }
    
            // examine the contidion to win
            if (allRowsFilled && player.gameBoard.board[7].some(cell => cell.trim() !== '')) {
                this.finish_game = true;
                console.log(`Game finished. Player ${this.players.indexOf(player) + 1} has filled all rows.`);
                this.calculateWinner();
                break;
            }
        }
    }
    
    calculateWinner() {
        let maxScore = 0;
        let winnerIndex = null;
    
        this.players.forEach((player, index) => {
            let score = 0;
            player.gameBoard.board.forEach(row => {
                const word = row.join('').trim();
                if (word.length > 2) { 
                    score += word.length ** 2;
                }
            });
    
            console.log(`Player ${index + 1}'s total score: ${score}`);
            if (score > maxScore) {
                maxScore = score;
                winnerIndex = index;
            }
        });
    
        console.log(`The winner is Player ${winnerIndex + 1} with ${maxScore} points.`);
    }


    
    // define the action that the player will play in each round
    async player_round(playerIndex){
        console.log(`Player ${playerIndex+1}'s turn start!`);
        // draw letter for each player after each of them has played one turn
        if (this.roundsCompleted.every(round => round > 0)) {
            this.drawLetter(playerIndex);
        }

        this.printPlayerHand(playerIndex);
        this.printPlayerGameBoard(playerIndex);
        await this.playeraction(playerIndex);
        console.log(`Player ${playerIndex+1}'s turn finish!\n`);
        this.roundsCompleted[playerIndex] += 1;
        this.isGameFinished();
    }


    async run() {
        while (!this.finish_game) { 
            for (let i = 0; i < this.players.length; i++) {
                await this.player_round(i);
                if (this.finish_game) break; 
            }
        }
        rl.close(); 
    }
}


(async () => {
    const game = new Game(2);
    game.run();
})();
