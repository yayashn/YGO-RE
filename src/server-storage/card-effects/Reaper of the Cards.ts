import {
    getCard,
    getFilteredCards,
    getTargets,
    pickTargets,
    setTargets,
    stringifyCards
} from 'server/utils'
import type { CardFolder, DuelFolder, PlayerValue } from 'server/types'
import NormalSpell from 'server-storage/conditions/NormalSpell'
import { CardEffect } from '.'

/*
    FLIP: Select 1 Trap Card on the field and destroy it. 
    If the selected card is Set, pick up and see the card.
    If it is a Trap Card, it is destroyed. If it is a Spell Card, 
    return it to its original position.
*/
export default (card: CardFolder) => {
    const controller = card.controller.Value
    const duel = controller.Parent as DuelFolder

    const target = () => {
        const faceUpTraps = getFilteredCards(duel, {
            location: ['SZone1', 'SZone2', 'SZone3', 'SZone4', 'SZone5'],
            position: ['FaceUp'],
            type: ['Trap Card']
        })
        const faceDownCards = getFilteredCards(duel, {
            location: ['SZone1', 'SZone2', 'SZone3', 'SZone4', 'SZone5'],
            position: ['FaceDown']
        })
        card.targets.Value = pickTargets(controller, 1, stringifyCards([...faceUpTraps, ...faceDownCards]))
    }

    const effect = () => {
        const target = getTargets(controller, card.targets.Value)[0]
        if(target.position.Value === "FaceDown") {
            target.reveal.Invoke()
        }
        if(target.type.Value === "Trap Card") {
            target.destroy_.Fire("Effect")
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
