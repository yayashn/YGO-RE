import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from "..";
import type { Card } from "server/duel/card";
import { getDuel } from "server/duel/duel";
import { getFilteredCards } from "server/duel/utils";

/*
    Destroy all Spell and Trap Cards on the field.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

    const effect = () => {
        const cardsInSZone = getFilteredCards(duel, {
            location: ['SZone1', 'SZone2', 'SZone3', 'SZone4', 'SZone5'],
        })
        cardsInSZone.forEach(c => c.destroy("Effect", card))
    }

    const condition = () => {
        const cardsInSZone = getFilteredCards(duel, {
            location: ['SZone1', 'SZone2', 'SZone3', 'SZone4', 'SZone5'],
        })
        return cardsInSZone.size() > 0
    }

    const effects: CardEffect[] = [
        {
            condition: () => NormalSpell(card) && condition(),
            effect: () => effect(),
            location: ['SZone']
        }
    ]

    return effects
}