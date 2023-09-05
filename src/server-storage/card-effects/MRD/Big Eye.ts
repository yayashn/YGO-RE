import type { Card } from 'server/duel/card'
import { CardEffect } from '..'
import { getDuel } from 'server/duel/duel'
import { getFilteredCards } from 'server/duel/utils'

/*
    FLIP: Look at up to 5 cards from the top of your Deck, 
    then place them on the top of the Deck in any order.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

    const effect = () => {
        const top5Cards = getFilteredCards(duel, {
            order: [0, 1, 2, 3, 4],
            location: ['Deck'],
            controller: [controller.player],
        })
        controller.pickTargets(5, top5Cards).forEach((c, i) => {
            c.order.set(i)
        })
    }

    const effects: CardEffect[] = [
        {
            condition: () => false,
            effect: () => effect(),
            trigger: "FLIP"
        }
    ]

    return effects
}
