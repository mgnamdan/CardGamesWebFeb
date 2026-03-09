import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = readline.createInterface({ input, output });

async function getInput(promptText) {
    return await rl.question(promptText);
}

function display(message = "") {
    console.log(message);
}

function displayLines(lines = []) {
    for (const line of lines) {
        console.log(line);
    }
}

function closeIO() {
    rl.close();
}

export { getInput, display, displayLines, closeIO };