import type { Card } from "server/duel/card"
import NormalEffect from "server-storage/conditions/NormalEffect";
import { getDuel } from "server/duel/duel";
import { CardEffect } from "..";
import { getFilteredCards } from "server/duel/utils";
import { includes } from "shared/utils";
import { throttle } from "@rbxts/set-timeout";

/*
    All LIGHT monsters on the field gain 500 ATK, also all DARK monsters on the field lose 400 ATK.
*/

const BUFF_ATK = 400
const BUFF_ATTRIBUTES = ['LIGHT']

const NERF_ATK = -400
const NERF_ATTRIBUTES = ['DARK']

export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!
    
    const condition = () => {
        if(!includes(card.location.get(), "MZone")) return false
        if(!includes(card.position.get(), "FaceUp")) return false
        return true   
    }

    const effect = async () => {
        duel.addCardFloodgate(`MODIFY_ATK`,{
            floodgateFilter: {
                location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
                attribute: BUFF_ATTRIBUTES,
                position: ['FaceUpAttack', 'FaceUpDefense']
            },
            expiry: () => {
                return !includes(card.location.get(), "MZone") || !includes(card.position.get(), "FaceUp")
            },
            floodgateValue: {
                value: BUFF_ATK,
                modifierId: `+ATK_${card.uid}`
            }
        })

        duel.addCardFloodgate('MODIFY_ATK', {
            floodgateFilter: {
                location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
                attribute: NERF_ATTRIBUTES,
                position: ['FaceUpAttack', 'FaceUpDefense']
            },
            expiry: () => {
                return !includes(card.location.get(), "MZone") || !includes(card.position.get(), "FaceUp")
            },
            floodgateValue: {
                value: NERF_ATK,
                modifierId: `-ATK_${card.uid}`
            }
        })
    }

    const effects: CardEffect[] = [
        {
            continuous: {
                effect: effect,
                condition: condition,
            },
        }
    ]

    return effects
}