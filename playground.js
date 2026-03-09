import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import BJManager from "./managers.js";

const rl = readline.createInterface({ input, output });

function printHand(title, hand) {
    console.log(title);
    for (let i = 0; i < hand.length; i++) {
        console.log(`${i + 1}. ${hand[i]}`);
    }
    console.log("");
}

function printTable(manager) {
    const hands = manager.getFaceUpHands();

    console.log("\n=== TABLE ===\n");

    for (const player of hands.Computers) {
        printHand(`${player.name}'s hand:`, player.hand);
    }

    for (const player of hands.Humans) {
        printHand(`${player.name}'s hand:`, player.hand);
    }
}

async function askHumanChoice(player) {
    while (true) {
        const answer = await rl.question(
            `${player.name}, would you like to hit or stay? -> `
        );

        const cleaned = answer.trim().toLowerCase();
        const normalized = player.makeChoice(cleaned);

        if (normalized === "hit" || normalized === "stay") {
            return normalized;
        }

        console.log('Please enter "hit", "stay", "h", or "s".\n');
    }
}

async function playOneGame() {
    const manager = new BJManager();

    console.log("Welcome to Blackjack.\n");

    const playerNameRaw = await rl.question("What is your name? -> ");
    const playerName = playerNameRaw.trim() || "Player";

    let numComps;
    while (true) {
        const compRaw = await rl.question("How many computer opponents? -> ");
        numComps = Number(compRaw);

        if (Number.isInteger(numComps) && numComps >= 0) {
            break;
        }

        console.log("Please enter a whole number 0 or greater.\n");
    }

    manager.setupGame(playerName, numComps);

    console.log("\nInitial deal:");
    printTable(manager);

    for (const player of manager.players.Humans) {
        while (true) {
            player.calcScore();

            if (player.giveScore() > 21 || player.hand.length > 5) {
                break;
            }

            printHand(`${player.name}'s hand:`, player.getVisibleHand());
            console.log(`Current score: ${player.giveScore()}\n`);

            const choice = await askHumanChoice(player);

            if (choice === "hit") {
                player.drawCard(manager.deck.draw());
                console.log("");
            } else {
                break;
            }
        }

        manager.calculateScore(player);
    }

    console.log("\nDealer and computer turns...\n");

    for (const player of manager.players.Computers) {
        manager.manageTurn(player);
    }

    console.log("=== FINAL HANDS ===\n");

    for (const player of manager.players.Computers) {
        printHand(`${player.name}'s hand:`, player.getFullHand());
        console.log(`Score: ${player.giveScore()}\n`);
    }

    for (const player of manager.players.Humans) {
        printHand(`${player.name}'s hand:`, player.getFullHand());
        console.log(`Score: ${player.giveScore()}\n`);
    }

    console.log("=== RESULTS ===\n");
    console.log(manager.getWinnerText());
    console.log("");

    const scores = manager.getScores();
    console.log("Scoreboard:");
    for (const [name, score] of Object.entries(scores)) {
        console.log(`${name}: ${score}`);
    }
    console.log("");
}

async function main() {
    let playing = true;

    while (playing) {
        await playOneGame();

        const again = await rl.question("Would you like to play again? -> ");
        const cleaned = again.trim().toLowerCase();

        playing = cleaned === "y" || cleaned === "yes";
        console.log("");
    }

    console.log("Thanks for playing.");
        rl.close();
    }

    main().catch(err => {
        console.error("An error occurred:", err);
        rl.close();
    }
);