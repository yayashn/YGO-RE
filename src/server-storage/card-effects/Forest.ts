import NormalSpell from 'server-storage/conditions/NormalSpell'
import { CardEffect } from '.'
import { getDuel } from 'server/duel/duel'
import { Card } from 'server/duel/card'
import { getCards, getFilteredCards } from 'server/duel/utils'

/*
    All Insect, Beast, Plant, and Beast-Warrior monsters on the field gain 200 ATK/DEF.
*/
const BUFF_ATK = 200
const BUFF_DEF = 200
const BUFF_RACES = ['Insect', 'Beast', 'Plant', 'Beast-Warrior']

export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!
    
    const meetsBuffCondition = (c: Card) => {
        const buffedCards = getFilteredCards(duel, {
            race: BUFF_RACES,
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            position: ['FaceUpAttack', 'FaceUpDefense'],
        })

        return buffedCards.includes(c)
    }


    const effect = () => {

    }

    const effects: CardEffect[] = [
        {
            condition: () => NormalSpell(card),
            effect: () => effect(),
            location: ['FZone']
        }
    ]

    return effects
}