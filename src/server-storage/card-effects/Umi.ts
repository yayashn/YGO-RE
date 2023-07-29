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

    const effect = () => {
        duel.addCardFloodgate({
            floodgateName: `MODIFY_ATK`,
            floodgateFilter: {
                location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
                race: BUFF_RACES,
                position: ['FaceUpAttack', 'FaceUpDefense']
            },
            expiry: () => {
                return card.location.get() !== "FZone" || card.position.get() !== "FaceUp"
            },
            floodgateValue: {
                value: BUFF_ATK,
                modifierId: `+ATK_${card.uid}`
            }
        })

        duel.addCardFloodgate({
            floodgateName: `MODIFY_DEF`,
            floodgateFilter: {
                location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
                race: BUFF_RACES,
                position: ['FaceUpAttack', 'FaceUpDefense']
            },
            expiry: () => {
                return card.location.get() !== "FZone" || card.position.get() !== "FaceUp"
            },
            floodgateValue: {
                value: BUFF_DEF,
                modifierId: `+DEF_${card.uid}`
            }
        })

        duel.addCardFloodgate({
            floodgateName: `MODIFY_ATK`,
            floodgateFilter: {
                location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
                race: NERF_RACES,
                position: ['FaceUpAttack', 'FaceUpDefense']
            },
            expiry: () => {
                return card.location.get() !== "FZone" || card.position.get() !== "FaceUp"
            },
            floodgateValue: {
                value: NERF_ATK,
                modifierId: `-ATK_${card.uid}`
            }
        })

        duel.addCardFloodgate({
            floodgateName: `MODIFY_DEF`,
            floodgateFilter: {
                location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
                race: NERF_RACES,
                position: ['FaceUpAttack', 'FaceUpDefense']
            },
            expiry: () => {
                return card.location.get() !== "FZone" || card.position.get() !== "FaceUp"
            },
            floodgateValue: {
                value: NERF_DEF,
                modifierId: `-DEF_${card.uid}`
            }
        })
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