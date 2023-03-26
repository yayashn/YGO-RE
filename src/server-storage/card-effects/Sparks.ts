import { getOpponent } from "server/utils";
import type { CardFolder } from "server/types";
import NormalSpell from "server-storage/conditions/NormalSpell";
import QuickSpell from "server-storage/conditions/QuickSpell";
import { CardEffect } from ".";

/*
    Inflict 200 points of damage to your opponent's Life Points.
*/
export default (card: CardFolder) => {
    const controller = card.controller.Value
    const opponent = getOpponent(controller)

    const effects: CardEffect[] = [
        {
            condition: () => QuickSpell(card),
            effect: () => opponent.updateLP.Fire(-200),
            location: ['SZone']
        }
    ]

    return effects
}