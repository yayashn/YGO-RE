import type { Card } from 'server/duel/card'
import { CardEffect } from "..";
import { getDuel } from 'server/duel/duel'
import { getFilteredCards } from 'server/duel/utils'

/*
    FLIP: Select 1 Trap Card on the field and destroy it. 
    If the selected card is Set, pick up and see the card.
    If it is a Trap Card, it is destroyed. If it is a Spell Card, 
    return it to its original position.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

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
        if(faceUpTraps.size() + faceDownCards.size() === 0) return;
        card.targets.set(controller.pickTargets(1, [...faceUpTraps, ...faceDownCards]))
    }

    const effect = () => {
        const target = card.targets.get()[0]

        if(!target) return;

        if(target.position.get() === "FaceDown") {
            target.reveal()
        }
        if(target.type.get() === "Trap Card") {
            target.destroy("Effect", card)
        }
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
