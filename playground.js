import Card from "./card.js";

const c1 = new Card("Ace", "Spades");
const c2 = new Card("Ace", "Spades");
const c3 = new Card("King", "Hearts");

console.log(c1.toString());
console.log(c1.equals(c2));
console.log(c1.equals(c3)); 