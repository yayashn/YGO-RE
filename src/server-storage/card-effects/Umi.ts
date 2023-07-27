import NormalSpell from 'server-storage/conditions/NormalSpell'
import { CardEffect } from '.'
import { getDuel } from 'server/duel/duel'
import { Card } from 'server/duel/card'
import { getCards, getFilteredCards } from 'server/duel/utils'
import { includes } from 'shared/utils'

/*
 All Fish, Sea Serpent, Thunder, and Aqua monsters on the field gain 200 ATK/DEF,
 also all Machine and Pyro monsters on the field lose 200 ATK/DEF.
*/
const BUFF_ATK = 200
const BUFF_DEF = 200
const BUFF_RACES = ['Fish', 'Sea Serpent', 'Thunder', 'Aqua']

const NERF_ATK = -200
const NERF_DEF = -200
const NERF_RACES = ['Machine', 'Pyro']

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

    const meetsNerfCondition = (c: Card) => {
        const nerfedCards = getFilteredCards(duel, {
            race: NERF_RACES,
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            position: ['FaceUpAttack', 'FaceUpDefense'],
        })

        return nerfedCards.includes(c)
    }

    const effect = () => {
        const connections: RBXScriptConnection[] = []
        
        const allCards = getCards(duel)

        const handleBuff = (buffedCard: Card) => {
            const floodgates = buffedCard.getFloodgates(`ATK_BOOST:${BUFF_ATK}_${card.uid}`)
            const buffed = floodgates ? floodgates.size() > 0 : false
            const buffCondition = meetsBuffCondition(buffedCard)
            if (buffCondition && !buffed) {
                buffedCard.addFloodgate(`ATK_BOOST:${BUFF_ATK}_${card.uid}`, () => {
                    return !meetsBuffCondition(buffedCard) 
                    || card.location.get() !== 'FZone' 
                    || card.position.get() !== 'FaceUp'
                })
                buffedCard.addFloodgate(`DEF_BOOST:${BUFF_DEF}_${card.uid}`, () => {
                    return !meetsBuffCondition(buffedCard) 
                    || card.location.get() !== 'FZone' 
                    || card.position.get() !== 'FaceUp'
                })
            }
        }

        const handleNerf = (nerfedCard: Card) => {
            const floodgates = nerfedCard.getFloodgates(`ATK_REDUCTION:${NERF_ATK}_${card.uid}`)
            const nerfed = floodgates ? floodgates.size() > 0 : false;
            const nerfCondition = meetsNerfCondition(nerfedCard)
            if (nerfCondition && !nerfed) {
                nerfedCard.addFloodgate(`ATK_REDUCTION:${NERF_ATK}_${card.uid}`, () => {
                    return !meetsNerfCondition(nerfedCard) 
                    || card.location.get() !== 'FZone' 
                    || card.position.get() !== 'FaceUp'
                })
                nerfedCard.addFloodgate(`DEF_REDUCTION:${NERF_DEF}_${card.uid}`, () => {
                    return !meetsNerfCondition(nerfedCard) 
                    || card.location.get() !== 'FZone' 
                    || card.position.get() !== 'FaceUp'
                })
            }
        }

        allCards.forEach(c => {
            const initBuffs = () => {
                if (meetsBuffCondition(c)) {
                    handleBuff(c)
                } else if (meetsNerfCondition(c)) {
                    handleNerf(c)
                }
            }

            initBuffs()

            connections.push(c.changed.changed(() => {
                initBuffs()
            }))
        })

        connections.push(card.changed.changed(() => {
            if (card.location.get() !== 'FZone' || card.position.get() !== 'FaceUp') {
                connections.forEach(c => c.Disconnect())
            }
        }))
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