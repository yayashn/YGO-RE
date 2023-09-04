import type { Card } from "server/duel/card"
import NormalEffect from "server-storage/conditions/NormalEffect";
import { getDuel } from "server/duel/duel";
import { CardEffect } from "..";
import { getFilteredCards } from "server/duel/utils";
import { includes } from "shared/utils";
import { throttle } from "@rbxts/set-timeout";

/*
    This card gains 100 ATK for each monster in your Graveyard.
*/

let execCount = 0
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
            const controllerGraveyard = getFilteredCards(duel, {
                location: ['GZone'],
                controller: [card.getController().player],
                type: ['Monster'],
            })
    
            duel.addCardFloodgate( `MODIFY_ATK`, {
                floodgateFilter: {
                    card: [card],
                },
                expiry: () => {
                    if(!includes(card.location.get(), "MZone")) return true
                    if(!includes(card.position.get(), "FaceUp")) return true
    
                    const newControllerGraveyard = getFilteredCards(duel, {
                        location: ['GZone'],
                        controller: [card.getController().player],
                        type: ['Monster'],
                    })
                    if(newControllerGraveyard.size() !== controllerGraveyard.size()) {
                        addContinuousAtk(newControllerGraveyard.size() * 100)
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

        addContinuousAtk(getFilteredCards(duel, {
            location: ['GZone'],
            controller: [card.getController().player],
            type: ['Monster'],
        }).size() * 100)
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