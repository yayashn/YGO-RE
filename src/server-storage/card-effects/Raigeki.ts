import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from ".";
import type { Card } from "server/duel/card";
import { getDuel } from "server/duel/duel";
import { getFilteredCards } from "server/duel/utils";

/*
    Destroy all monsters your opponent controls.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

    const effect = () => {
        const cardsInMZone = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            controller: [duel.getOpponent(controller.player).player]
        })
        cardsInMZone.forEach(card => card.destroy("Effect"))
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