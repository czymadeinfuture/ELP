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
        this.process_game()
    }

    initializeGame(numberOfPlayers) {
        //add dict of words
        this.letterBag = new LetterBag();
        this.playersHands = new Array(numberOfPlayers).fill(null).map(() => []);
        this.playersWordPools = new Array(numberOfPlayers).fill(null).map(() => []);
        this.playerspoints= new Array(numberOfPlayers).fill(0)
        let finish_game=false;
        for (let i = 0; i < this.playersHands.length; i++) {
            for (let j = 0; j < 6; j++) {
                this.playersHands[i].push(this.letterBag.drawLetter());
            }
        }
    }

    process_game(){
        while (this.finish_game==false){
            for (let i=0;i<this.playersHands.length;i++){
                this.player_round(i);
                this.calculate_point();
                this.is_game_finished();
                if (this.finish_game==true){
                    break;
                }
            }
        }
    }

    player_round(playerIndex){
        console.log(`Player ${playerIndex}'s turn start!`);
        this.printPlayerHand(playerIndex);
        this.printPlayersWordPool();
        this.playeraction(playerIndex);
        console.log(`Player ${playerIndex}'s turn finish!`);
    }

    playeraction(playerIndex){
        let inputsucess=false;
        while (inputsucess==false){
            rl.question('input your action (New, Change, Nothing, Jarnac) as (1, 2, 3, 4): ', (input) => {
                switch(input) {
                    case '1':
                        this.New(playerIndex)
                        break;
                    case '2':
                        if (this.playersWordPools[playerIndex].length!=0){
                            this.Change(playerIndex)
                        }else{
                            console.log('you cannot change your card! Try again')
                        }
                    case '3':
                        pass;
                        break;
                    case '4':
                        this.Jarnac(playerIndex);
                        break;
                    default:
                        console.log('Invalid Input!');
                }
                rl.close();
            });
        }
    }

    New(playerIndex){

    }

    Change(playerIndex){

    }

    Jarnac(playerIndex){

    }

    calculate_point(){
        this.playersPoints = this.playersWordPools.map(wordPool => 
            wordPool.reduce((totalScore, word) => totalScore + Math.pow(word.length, 2), 0)
        );
    }

    is_game_finished(){
        for (let i = 0; i < this.playersHands.length; i++) {
            if (this.PlayerWordPool(i).length>=7){
                this.finish_game=true;
                console.log(`game finish. Player ${i} end the game.`);
                this.printPlayersWordPool();
                this.playersPoints.forEach((points, index) => {
                    console.log(`Player ${index}'s score: ${points}`);
                });
                let maxScore = Math.max(...this.playersPoints);
                let winnerIndex = this.playersPoints.indexOf(maxScore);
                console.log(`Winner is player ${winnerIndex}! Score: ${maxScore}!`);
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
const readline = require('readline');

// 创建 readline 接口实例
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
numberOfPlayers=2
const game = new Game(numberOfPlayers);
