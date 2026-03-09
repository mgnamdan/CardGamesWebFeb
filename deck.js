import Card from "./card.js";

export default class Deck {

    static RANKS = [
        "Two","Three","Four","Five","Six","Seven","Eight",
        "Nine","Ten","Jack","Queen","King","Ace"
    ];

    static SUITS = ["Clubs","Diamonds","Spades","Hearts"];

    constructor() {
        this.drawPile = [];
        this.discardPile = [];
        this.outPile = [];
        this.setupDrawPile();
    }

    setupDrawPile() {
        for (const suit of Deck.SUITS) {
            for (const rank of Deck.RANKS) {
                const newCard = new Card(rank, suit);
                this.drawPile.push(newCard);
            }
        }
    }

    toString() {
        return this.drawPile.map(card => card.toString()).join("\n");
    }

    equals(other) {
        return false;
    }

    draw() {
        const drawnCard = this.drawPile.shift();
        this.outPile.push(drawnCard);
        return drawnCard;
    }

    discard(card) {
        const index = this.outPile.indexOf(card);
        if (index !== -1) {
            this.outPile.splice(index, 1);
            this.discardPile.push(card);
        }
    }

    deckShuffle() {
        for (let i = this.drawPile.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.drawPile[i], this.drawPile[j]] = [this.drawPile[j], this.drawPile[i]];
        }
    }
}