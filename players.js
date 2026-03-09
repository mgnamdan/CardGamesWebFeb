class CmpPlayer {
    static RANKVALUES = {
        Two: 2,
        Three: 3,
        Four: 4,
        Five: 5,
        Six: 6,
        Seven: 7,
        Eight: 8,
        Nine: 9,
        Ten: 10,
        Jack: 10,
        Queen: 10,
        King: 10,
        Ace: 11
    };

    constructor(name = "Bob") {
        this.name = name;
        this.hand = [];
        this.score = 0;
    }

    toString() {
        return `${this.name}`;
    }

    equals(other) {
        if (this.constructor !== other.constructor) {
            return false;
        }

        if (this.name !== other.name) {
            return false;
        }

        if (this.hand.length !== other.hand.length) {
            return false;
        }

        for (let idx = 0; idx < this.hand.length; idx++) {
            if (!this.hand[idx].equals(other.hand[idx])) {
                return false;
            }
        }

        return true;
    }

    giveScore() {
        return this.score;
    }

    drawCard(card) {
        this.hand.push(card);
    }

    discardCard(cardIdx) {
        const returnedCard = this.hand.splice(cardIdx, 1)[0];
        return returnedCard;
    }

    calcScore() {
        this.score = 0;

        if (this.hand.length !== 0) {
            for (const card of this.hand) {
                this.score += CmpPlayer.RANKVALUES[card.rank];
            }
        }
    }

    getHand() {
        return this.hand;
    }

    getVisibleHand() {
        const visibleHand = [];

        if (this.hand.length > 0) {
            visibleHand.push("(Hidden)");

            for (let idx = 1; idx < this.hand.length; idx++) {
                visibleHand.push(this.hand[idx].toString());
            }
        }

        return visibleHand;
    }

    getFullHand() {
        return this.hand.map(card => card.toString());
    }

    makeChoice() {
        this.calcScore();

        if (this.score > 17) {
            return "stay";
        } else {
            return "hit";
        }
    }
}

class HmnPlayer extends CmpPlayer {
    constructor(name = "Bob") {
        super(name);
    }

    discardCard(idxChoice) {
        const returnedCard = this.hand.splice(idxChoice - 1, 1)[0];
        return returnedCard;
    }

    getVisibleHand() {
        return this.hand.map(card => card.toString());
    }

    makeChoice(choice) {
        this.calcScore();

        choice = choice.toLowerCase();

        if (choice === "h") {
            choice = "hit";
        }

        if (choice === "s") {
            choice = "stay";
        }

        return choice;
    }
}

export { CmpPlayer, HmnPlayer };