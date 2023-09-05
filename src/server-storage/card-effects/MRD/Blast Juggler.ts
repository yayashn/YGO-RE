import type { Card } from 'server/duel/card'
import { getDuel } from 'server/duel/duel'
import { CardEffect } from '..'
import { includes } from 'shared/utils'
import QuickEffect from 'server-storage/conditions/QuickEffect'
import { getFilteredCards } from 'server/duel/utils'

/*
    You can only activate this effect during your Standby Phase. 
    Tribute this face-up card to target and destroy 2 face-up monsters with an ATK 1000 or less.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

    const condition = () => {
        return (
            QuickEffect(card) &&
            includes(card.location.get(), 'MZone') &&
            includes(card.position.get(), 'FaceUp') &&
            duel.phase.get() === "SP" &&
            duel.turnPlayer.get() === controller &&
            getFilteredCards(duel, {
                atk: ['<=1000'],
                location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
                position: ['FaceUpAttack', 'FaceUpDefense'],
            }).filter(c => c !== card).size() >= 2
        )
    }

    const cost = () => {
        card.tribute()
    }

    const target = () => {
        const targettableCards = getFilteredCards(duel, {
            atk: ['<=1000'],
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            position: ['FaceUpAttack', 'FaceUpDefense'],
        }).filter(c => c !== card)
        const targets = controller.pickTargets(2, targettableCards)
        card.targets.set(targets)
    }

    const effect = async () => {
        card.targets.get().forEach(c => {
            c.destroy('Effect', card)
        })
    }

    const effects: CardEffect[] = [
        {
            condition: () => condition(),
            cost: () => cost(),
            target: () => target(),
            effect: () => effect(),
            location: ['MZone']
        }
    ]

    return effects
}
