import type { Card } from "server/duel/card"
import NormalSpell from "server-storage/conditions/NormalSpell";
import { getDuel } from "server/duel/duel";
import { CardEffect } from "..";
import { getFilteredCards } from "server/duel/utils";
import { includes } from "shared/utils";

/*
    Discard up to 3 Monster Cards from your hand to the Graveyard.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!
    
    const condition = () => {
        const cardsInHand = getFilteredCards(duel, {
            location: ["Hand"],
            controller: [controller.player],
            type: ["Monster"]
        })
        return cardsInHand.size() >= 1
    }

    const effect = () => {
        const targets = controller.pickTargets(3, getFilteredCards(duel, {
            location: ["Hand"],
            controller: [controller.player],
            type: ["Monster"]
        }), 1)
        targets.forEach(c => {
            c.toGraveyard()
        })
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