class Card {

    constructor(rank = "Two", suit = "Clubs") {
        this.rank = rank;
        this.suit = suit;
        }

    toString() {
        return `${this.rank} of ${this.suit}`;
        }

    equals(other) {
        if (other instanceof Card) {
            if (this.rank === other.rank && this.suit === other.suit) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
        }

}

export default Card;