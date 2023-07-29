import NormalSpell from 'server-storage/conditions/NormalSpell'
import { CardEffect } from '.'
import { getDuel } from 'server/duel/duel'
import { Card } from 'server/duel/card'
import { getCards, getFilteredCards } from 'server/duel/utils'

/*
    All Dinosaur, Zombie, and Rock monsters on the field gain 200 ATK/DEF.
*/
const BUFF_ATK = 200
const BUFF_DEF = 200
const BUFF_RACES = ['Dinosaur', 'Zombie', 'Rock']

export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!


    const effects: CardEffect[] = [
        {
            condition: () => NormalSpell(card),
            effect: () => {},
            location: ['FZone']
        }
    ]

    return effects
}