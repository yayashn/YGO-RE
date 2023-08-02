import type { Card } from "server/duel/card"
import NormalSpell from "server-storage/conditions/NormalSpell";
import { getDuel } from "server/duel/duel";
import { CardEffect } from "..";
import { getFilteredCards } from "server/duel/utils";

/*
Once per turn: You can toss a coin and call it. If you call it right,
 destroy all monsters your opponent controls. If you call it wrong, 
 destroy as many monsters you control as possible, and if you do, take 
 damage equal to half the total ATK those destroyed monsters had while face-up 
 on the field.
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