import { getOpponent } from "server/utils";
import type { CardFolder } from "server/types";
import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from ".";

/*
    Inflict 500 damage to your opponent.
*/
export default (card: CardFolder) => {
    const controller = card.controller.Value
    const opponent = getOpponent(controller)

    const effects: CardEffect[] = [
        {
            condition: () => NormalSpell(card),
            effect: () => opponent.updateLP.Fire(-500),
            location: ['SZone']
        }
    ]

    return effects
}