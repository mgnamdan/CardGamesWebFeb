import Deck from "./deck.js";
import { CmpPlayer, HmnPlayer } from "./players.js";

class BJManager {
    static COMPNAMES = [
        "Angela", "Chelsea", "Daryl", "Elizabeth", "Fred", "Gabby",
        "Harold", "Irene", "Julie", "Katie", "Lindsey", "Mike",
        "Nancy", "Oliver", "Pat", "Richard", "Samantha", "Terrence",
        "Ursula", "Vic", "Wendy", "Xavier", "Yanni", "Zach"
    ];

    constructor() {
        this.reset();
    }

    reset() {
        this.deck = new Deck();
        this.dealer = new CmpPlayer("Dealer");
        this.players = {
            Computers: [this.dealer],
            Humans: []
        };
        this.scores = {};
        this.winners = [];
    }

    starterDeal() {
        for (let i = 0; i < 2; i++) {
            for (const player of this.players.Computers) {
                player.drawCard(this.deck.draw());
            }
            for (const player of this.players.Humans) {
                player.drawCard(this.deck.draw());
            }
        }
    }

    calculateScore(player) {
        player.calcScore();
        this.scores[player.name] = player.giveScore();
    }

    promptNextGame(choice) {
        this.reset();
        choice = choice.toLowerCase();
        if (choice === "y" || choice === "yes") {
            return true;
        }
        return false;
    }

    manageTurn(player, humanChoiceProvider = null) {
        let play = true;

        while (play) {
            player.calcScore();
            const playerScore = player.giveScore();

            if (playerScore > 21) {
                play = false;
            } else if (player.hand.length > 5) {
                play = false;
            } else {
                let choice;

                if (player instanceof HmnPlayer) {
                    if (!humanChoiceProvider) {
                        throw new Error("Human player requires a choice provider.");
                    }
                    const rawChoice = humanChoiceProvider(player);
                    choice = player.makeChoice(rawChoice);
                } else {
                    choice = player.makeChoice();
                }

                if (choice === "hit") {
                    player.drawCard(this.deck.draw());
                } else {
                    play = false;
                }
            }
        }

        this.calculateScore(player);
    }

    determineWinners() {
        const validScores = Object.values(this.scores).filter(score => score <= 21);

        if (validScores.length === 0) {
            return [];
        }

        const highScore = Math.max(...validScores);
        const winners = Object.keys(this.scores).filter(
        name => this.scores[name] === highScore
        );

        return winners;
    }

    setupGame(playerName, numComps) {
        this.reset();

        this.players.Humans.push(new HmnPlayer(playerName));

        for (let i = 0; i < numComps; i++) {
            const randIdx = Math.floor(Math.random() * BJManager.COMPNAMES.length);
            const newPlayer = new CmpPlayer(BJManager.COMPNAMES[randIdx]);
            this.players.Computers.push(newPlayer);
        }

        this.players.Computers.reverse();

        for (let i = 3; i < 7; i++) {
            this.deck.deckShuffle();
        }

        this.starterDeal();
    }

    getFaceUpHands() {
        return {
            Computers: this.players.Computers.map(player => ({
                name: player.name,
                hand: player.getVisibleHand()
            })),
            Humans: this.players.Humans.map(player => ({
                name: player.name,
                hand: player.getVisibleHand()
            }))
        };
    }

    getScores() {
        return this.scores;
    }

    getWinnerText() {
        const winners = this.determineWinners();

        if (winners.length === 0) {
            return "Everybody busts! Nobody wins!";
        } else if (winners.includes(this.dealer.name)) {
            return "The dealer wins! Better luck next time!";
        } else if (winners.length === 1) {
            return `${winners[0]} wins with a score of ${this.scores[winners[0]]}!`;
        } else if (winners.length === 2) {
            return `${winners[0]} and ${winners[1]} both win with a score of ${this.scores[winners[0]]}!`;
        } else {
            const score = this.scores[winners[0]];
            const allButLast = winners.slice(0, -1).join(", ");
            const last = winners[winners.length - 1];
            return `${allButLast}, and ${last} win with a score of ${score}!`;
        }
    }
}

export default BJManager;