import type { Card } from "server/duel/card";
import { getDuel } from "server/duel/duel";
import { getFilteredCards } from "server/duel/utils";
import { CardEffect } from "..";

/*
    FLIP: Target 1 monster on the field; destroy that target.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!
    
    const target = () => {
        const targettableCards = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
        })
        card.targets.set(controller.pickTargets(1, targettableCards))
    }

    const effect = () => {
        const targets = card.targets.get()
        targets[0].destroy("Effect", card)
    }

    const effects: CardEffect[] = [
        {
            condition: () => false,
            target: () => target(),
            effect: () => effect(),
            trigger: "FLIP"
        }
    ]

    return effects
}