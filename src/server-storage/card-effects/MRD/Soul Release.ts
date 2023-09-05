import type { Card } from "server/duel/card"
import NormalSpell from "server-storage/conditions/NormalSpell";
import { getDuel } from "server/duel/duel";
import { CardEffect } from "..";
import { getFilteredCards } from "server/duel/utils";
import { includes } from "shared/utils";

/*
    Target up to 5 cards in any GY(s); banish them.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!
    const opponent = duel.getOpponent(controller.player)
    
    const condition = () => {
        const cardsInGZone = getFilteredCards(duel, {
            location: ["GZone"]
        })
        return cardsInGZone.size() >= 1
    }

    const target = () => {
        const targettableCards = getFilteredCards(duel, {
            location: ["GZone"]
        })
        card.targets.set(controller.pickTargets(5, targettableCards, 1))
    }

    const effect = () => {
        card.targets.get().forEach(c => {
            c.banish("FaceUp")
        })
    }

    const effects: CardEffect[] = [
        {
            condition: () => NormalSpell(card) && condition(),
            effect: () => effect(),
            target: () => target(),
            location: ['SZone']
        }
    ]

    return effects
}