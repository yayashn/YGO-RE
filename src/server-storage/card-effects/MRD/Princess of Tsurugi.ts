import type { Card } from 'server/duel/card'
import { CardEffect } from '..'
import { getDuel } from 'server/duel/duel'
import { getFilteredCards } from 'server/duel/utils'

/*
    FLIP: Inflict 500 damage to your opponent for each Spell and Trap Card on 
    your opponent's side of the field.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!
    const opponent = duel.getOpponent(controller.player)

    const effect = () => {
        const spellsAndTraps = getFilteredCards(duel, {
            location: ['SZone1', 'SZone2', 'SZone3', 'SZone4', 'SZone5'],
            controller: [opponent.player],
            position: ['FaceUp'],
            type: ['Spell Card', 'Trap Card']
        })
        
        const facedown = getFilteredCards(duel, {
            location: ['SZone1', 'SZone2', 'SZone3', 'SZone4', 'SZone5'],
            controller: [opponent.player],
            position: ['FaceDown'],
        })

        opponent.changeLifePoints(-500 * (spellsAndTraps.size() + facedown.size()));
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
