import { getEquippedDeck, getProfile } from "server/profile-service/profiles";
import { Card } from "./card";

export class YPlayer {
    player: Player;
    cards: Card[];

    constructor(player: Player) {
        const equippedDeck = getEquippedDeck(player);

        this.player = player;
        this.cards = equippedDeck.deck.map((card, i) => new Card(card.name, player, i));
        this.cards = [...this.cards, ...equippedDeck.extra.map((card, i) => new Card(card.name, player, i))]
    }
}