import FieldSpell from 'server-storage/conditions/FieldSpell'
import { CardEffect } from "..";
import { getDuel } from 'server/duel/duel'
import { Card } from 'server/duel/card'

/*
    All Fiend and Spellcaster monsters on the field gain 200 ATK/DEF,
    also all Fairy monsters on the field lose 200 ATK/DEF.
*/
const BUFF_ATK = 200
const BUFF_DEF = 200
const BUFF_RACES = ['Fiend', 'Spellcaster']

const NERF_ATK = -200
const NERF_DEF = -200
const NERF_RACES = ['Fairy']

export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

    const effect = () => {
        duel.addCardFloodgate(`MODIFY_ATK`,{
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

        duel.addCardFloodgate(`MODIFY_DEF`, {
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

        duel.addCardFloodgate('MODIFY_ATK', {
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

        duel.addCardFloodgate('MODIFY_DEF', {
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
            condition: () => FieldSpell(card),
            effect: () => effect(),
            location: ['FZone']
        }
    ]

    return effects
}