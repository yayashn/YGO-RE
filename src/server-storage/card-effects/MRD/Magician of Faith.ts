import type { Card } from 'server/duel/card'
import { CardEffect } from '..'
import { getDuel } from 'server/duel/duel'
import { getFilteredCards } from 'server/duel/utils'

/*
    FLIP: Target 1 Spell in your GY; add that target to your hand.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

    const target = () => {
        const trapsInGY = getFilteredCards(duel, {
            location: ['GZone'],
            type: ['Spell Card'],
            controller: [controller.player]
        })

        if(trapsInGY.size() === 0) return;

        card.targets.set(controller.pickTargets(1, [...trapsInGY]))
    }

    const effect = () => {
        const target = card.targets.get()[0]
        if(!target) return;
        
        target.toHand()
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
