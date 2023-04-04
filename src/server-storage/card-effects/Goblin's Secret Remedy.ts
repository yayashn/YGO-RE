import type { CardFolder } from "server/types";
import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from ".";

/*
    Increase your Life Points by 600 points.
*/
export default (card: CardFolder) => {
    const controller = card.controller.Value

    const effects: CardEffect[] = [
        {
            condition: () => NormalSpell(card),
            effect: () => controller.updateLP.Fire(600),
            location: ['SZone']
        }
    ]

    return effects
}