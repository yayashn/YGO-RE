import cards from "shared/sets/cards";

export default function getCardData(cardName: string) {
    return cards.find(card => card.name === cardName);
}