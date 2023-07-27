import type { Card } from 'server/duel/card'
import { CardEffect } from '.'
import { getDuel } from 'server/duel/duel'
import { getFilteredCards } from 'server/duel/utils'

/*
    FLIP: Target 1 Spell Card on the field; destroy that target. 
    (If the target is Set, reveal it, and destroy it if it is a Spell Card. 
    Otherwise, return it to its original position.)
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

    const target = () => {
        const faceUpSpells = getFilteredCards(duel, {
            location: ['SZone1', 'SZone2', 'SZone3', 'SZone4', 'SZone5'],
            position: ['FaceUp'],
            type: ['Spell Card']
        })
        const faceDownCards = getFilteredCards(duel, {
            location: ['SZone1', 'SZone2', 'SZone3', 'SZone4', 'SZone5'],
            position: ['FaceDown']
        })
        card.targets.set(controller.pickTargets(1, [...faceUpSpells, ...faceDownCards]))
    }

    const effect = () => {
        const target = card.targets.get()[0]
        if(target.position.get() === "FaceDown") {
            target.reveal()
        }
        if(target.type.get() === "Spell Card") {
            target.destroy("Effect")
        }
    }

    const effects: CardEffect[] = [
        {
            condition: () => false,
            target: () => target(),
            effect: () => effect(),
            location: ['SZone']
        }
    ]

    return effects
}
