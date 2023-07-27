import type { Card } from "server/duel/card"
import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from ".";

/*
    Increase your Life Points by 500 points.
*/
export default (card: Card) => {
    const controller = card.getController()

    const effects: CardEffect[] = [
        {
            condition: () => NormalSpell(card),
            effect: () => controller.changeLifePoints(500),
            location: ['SZone']
        }
    ]

    return effects
}