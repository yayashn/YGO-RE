import { getFilteredCards, getOpponent } from "server/utils";
import type { CardFolder, DuelFolder } from "server/types";
import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from ".";

/*
    Destroy all monsters on the field.
*/
export default (card: CardFolder) => {
    const controller = card.controller.Value
    const duel = controller.Parent as DuelFolder

    const effect = () => {
        const cardsInMZone = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
        })
        cardsInMZone.forEach(card => card.destroy_.Fire("Effect"))
    }

    const effects: CardEffect[] = [
        {
            condition: () => NormalSpell(card),
            effect: () => effect(),
            location: ['SZone']
        }
    ]

    return effects
}