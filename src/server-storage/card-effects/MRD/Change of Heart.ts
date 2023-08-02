import type { Card } from "server/duel/card"
import NormalSpell from "server-storage/conditions/NormalSpell";
import { getDuel } from "server/duel/duel";
import { CardEffect } from "..";
import { getFilteredCards } from "server/duel/utils";

/*
Target 1 monster your opponent controls; take control of it until the End Phase.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!
    const opponent = duel.getOpponent(controller.player)

    const condition = () => {
        return getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            controller: [opponent.player],
        }).size() > 0;
    }

    const target = () => {
        const targettableCards = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            controller: [opponent.player],
        })
        card.targets.set(controller.pickTargets(1, targettableCards))
    }

    const effect = () => {
        const target = card.targets.get()[0]

        duel.addCardFloodgate(`TAKE_CONTROL`, {
            floodgateFilter: {
                location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            },
            floodgateValue: target,
            expiry: () => {
                return duel.phase.get() === "EP";
            }
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