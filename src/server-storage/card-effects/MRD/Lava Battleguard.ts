import type { Card } from "server/duel/card"
import NormalEffect from "server-storage/conditions/NormalEffect";
import { getDuel } from "server/duel/duel";
import { CardEffect } from "..";
import { getFilteredCards } from "server/duel/utils";
import { includes } from "shared/utils";
import { throttle } from "@rbxts/set-timeout";

/*
    This card gains 500 ATK for each "Swamp Battleguard" you control.
*/

export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!
    
    const condition = () => {
        if(!includes(card.location.get(), "MZone")) return false
        if(!includes(card.position.get(), "FaceUp")) return false
        return true   
    }

    const effect = async () => {
        const addContinuousAtk = (value: number) => {
            const swampBattleguards = getFilteredCards(duel, {
                location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
                name: ["Swamp Battleguard"],
                controller: [card.getController().player],
            })
    
            duel.addCardFloodgate( `MODIFY_ATK`, {
                floodgateFilter: {
                    card: [card],
                },
                expiry: () => {
                    if(!includes(card.location.get(), "MZone")) return true
                    if(!includes(card.position.get(), "FaceUp")) return true
    
                    const newSwampBattleguards = getFilteredCards(duel, {
                        location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
                        name: ["Swamp Battleguard"],
                        controller: [card.getController().player],
                    })
                    if(newSwampBattleguards.size() !== swampBattleguards.size()) {
                        addContinuousAtk(swampBattleguards.size() * 500)
                        return true;
                    }
                    return false
                },
                floodgateValue: {
                    value: value,
                    modifierId: `+ATK_${card.uid}`
                }
            })
        }

        const swampBattleguards = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            name: ["Swamp Battleguard"],
            controller: [card.getController().player],
        })
        addContinuousAtk(swampBattleguards.size() * 500)
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