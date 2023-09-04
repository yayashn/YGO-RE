import type { Card } from 'server/duel/card'
import { getDuel } from 'server/duel/duel'
import { CardEffect } from '..'
import { includes } from 'shared/utils'
import NormalEffect from 'server-storage/conditions/NormalEffect'
import { getFilteredCards } from 'server/duel/utils'

/*
    You can discard this card; add up to 2 "Thunder Dragon" from your Deck to your hand.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

    const condition = () => {
        const thunderDragons = getFilteredCards(duel, {
            name: ['Thunder Dragon'],
            location: ['Deck'],
            controller: [controller.player]
        })

        return (
            NormalEffect(card) &&
            includes(card.location.get(), 'Hand') &&
            thunderDragons.size() >= 1
        )
    }

    const cost = () => {
        card.toGraveyard()
    }

    const effect = async () => {
        const thunderDragons = getFilteredCards(duel, {
            name: ['Thunder Dragon'],
            location: ['Deck'],
            controller: [controller.player]
        })

        let targets: Card[] = [];
        if(thunderDragons.size() === 0) return;

        if(thunderDragons.size() === 1) {
            targets = controller.pickTargets(1, thunderDragons)
        } else if(thunderDragons.size() >= 2) {
            targets = controller.pickTargets(2, thunderDragons, 1)
        }

        targets.forEach((target) => {
            target.toHand()
        })
    }

    const effects: CardEffect[] = [
        {
            condition: () => condition(),
            cost: () => cost(),
            effect: () => effect(),
            location: ['MZone']
        }
    ]

    return effects
}
