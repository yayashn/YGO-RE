import type { CardFolder } from "server/types";
import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from ".";

/*
    Draw 2 cards.
*/
export default (card: CardFolder) => {
    const controller = card.controller.Value

    const effects: CardEffect[] = [
        {
            condition: () => NormalSpell(card),
            effect: () => controller.draw.Invoke(2),
            location: ['SZone']
        }
    ]

    return effects
}