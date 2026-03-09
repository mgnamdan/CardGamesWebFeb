import BJManager from "./managers.js";
import { getInput, display, displayLines, closeIO } from "./io.js";

function formatHandLines(title, hand) {
    const lines = [title];

    for (let i = 0; i < hand.length; i++) {
        lines.push(`${i + 1}. ${hand[i]}`);
    }

    lines.push("");
    return lines;
}

function displayTable(manager) {
    const hands = manager.getFaceUpHands();

    display("\n=== TABLE ===\n");

    for (const player of hands.Computers) {
        displayLines(formatHandLines(`${player.name}'s hand:`, player.hand));
    }

    for (const player of hands.Humans) {
        displayLines(formatHandLines(`${player.name}'s hand:`, player.hand));
    }
}

async function askHumanChoice(player) {
    while (true) {
        const answer = await getInput(
            `${player.name}, would you like to hit or stay? -> `
        );

        const cleaned = answer.trim().toLowerCase();
        const normalized = player.makeChoice(cleaned);

        if (normalized === "hit" || normalized === "stay") {
            return normalized;
        }

        display('Please enter "hit", "stay", "h", or "s".\n');
    }
}

async function askPlayerName() {
    const playerNameRaw = await getInput("What is your name? -> ");
    const playerName = playerNameRaw.trim();

    if (playerName === "") {
        return "Player";
    }

    return playerName;
}

async function askNumComps() {
    while (true) {
        const compRaw = await getInput("How many computer opponents? -> ");
        const numComps = Number(compRaw);

        if (Number.isInteger(numComps) && numComps >= 0) {
            return numComps;
        }

        display("Please enter a whole number 0 or greater.\n");
    }
}

async function runHumanTurn(manager, player) {
    while (true) {
        player.calcScore();

        if (player.giveScore() > 21 || player.hand.length > 5) {
            break;
        }

        displayLines(formatHandLines(`${player.name}'s hand:`, player.getVisibleHand()));
        display(`Current score: ${player.giveScore()}\n`);

        const choice = await askHumanChoice(player);

        if (choice === "hit") {
            player.drawCard(manager.deck.draw());
            display("");
        } else {
            break;
        }
    }

    manager.calculateScore(player);
}

function runComputerTurns(manager) {
    display("\nDealer and computer turns...\n");

    for (const player of manager.players.Computers) {
        manager.manageTurn(player);
    }
}

function displayFinalHands(manager) {
    display("=== FINAL HANDS ===\n");

    for (const player of manager.players.Computers) {
        displayLines(formatHandLines(`${player.name}'s hand:`, player.getFullHand()));
        display(`Score: ${player.giveScore()}\n`);
    }

    for (const player of manager.players.Humans) {
        displayLines(formatHandLines(`${player.name}'s hand:`, player.getFullHand()));
        display(`Score: ${player.giveScore()}\n`);
    }
}

function displayResults(manager) {
    display("=== RESULTS ===\n");
    display(manager.getWinnerText());
    display("");

    const scores = manager.getScores();
    display("Scoreboard:");

    for (const [name, score] of Object.entries(scores)) {
        display(`${name}: ${score}`);
    }

    display("");
}

async function playOneGame() {
    const manager = new BJManager();

    display("Welcome to Blackjack.\n");

    const playerName = await askPlayerName();
    const numComps = await askNumComps();

    manager.setupGame(playerName, numComps);

    display("\nInitial deal:");
    displayTable(manager);

    for (const player of manager.players.Humans) {
        await runHumanTurn(manager, player);
    }

    runComputerTurns(manager);
    displayFinalHands(manager);
    displayResults(manager);
}

async function askPlayAgain() {
    const again = await getInput("Would you like to play again? -> ");
    const cleaned = again.trim().toLowerCase();

    return cleaned === "y" || cleaned === "yes";
}

async function main() {
    let playing = true;

    while (playing) {
        await playOneGame();
        playing = await askPlayAgain();
        display("");
    }

    display("Thanks for playing.");
    closeIO();
}

main().catch(err => {
    display(`An error occurred: ${err.message}`);
    closeIO();
});