import type { Card } from "server/duel/card"
import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from "..";

/*
    Draw 2 cards.
*/
export default (card: Card) => {
    const controller = card.getController()

    const effects: CardEffect[] = [
        {
            condition: () => NormalSpell(card),
            effect: () => controller.draw(2),
            location: ['SZone']
        }
    ]

    return effects
}