import type { Card } from "server/duel/card"
import NormalSpell from "server-storage/conditions/NormalSpell";
import { getDuel } from "server/duel/duel";
import { CardEffect } from "..";
import { getFilteredCards } from "server/duel/utils";

/*
    Discard 1 card, then target 1 monster on the field; destroy it.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!
    
    const condition = () => {
        const cardsInHand = getFilteredCards(duel, {
            location: ['Hand'],
            controller: [controller.player],
        })
        const monstersOnField = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
        })

        return cardsInHand.size() > 0 && monstersOnField.size() > 0;
    }

    const cost = () => {
        const cardsInHand = getFilteredCards(duel, {
            location: ['Hand'],
            controller: [controller.player],
        })
        const target = card.getController().pickTargets(1, cardsInHand)[0]
        target.toGraveyard()
    }

    const target = () => {
        const targettableCards = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
        })
        card.targets.set(controller.pickTargets(1, targettableCards))
    }

    const effect = () => {
        const target = card.targets.get()[0]
        target.toGraveyard()
    }

    const effects: CardEffect[] = [
        {
            condition: () => NormalSpell(card) && condition(),
            effect: () => effect(),
            cost: () => cost(),
            target: () => target(),
            location: ['SZone']
        }
    ]

    return effects
}