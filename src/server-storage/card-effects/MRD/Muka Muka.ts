import type { Card } from "server/duel/card"
import NormalEffect from "server-storage/conditions/NormalEffect";
import { getDuel } from "server/duel/duel";
import { CardEffect } from "..";
import { getFilteredCards } from "server/duel/utils";
import { includes } from "shared/utils";
import { throttle } from "@rbxts/set-timeout";

/*
    This card gains 300 ATK and DEF for each card in your hand.
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
            const controllerHand = getFilteredCards(duel, {
                location: ['Hand'],
                controller: [card.getController().player],
            })
    
            duel.addCardFloodgate( `MODIFY_ATK`, {
                floodgateFilter: {
                    card: [card],
                },
                expiry: () => {
                    if(!includes(card.location.get(), "MZone")) return true
                    if(!includes(card.position.get(), "FaceUp")) return true
    
                    const newControllerHand = getFilteredCards(duel, {
                        location: ['Hand'],
                        controller: [card.getController().player],
                    })
                    if(newControllerHand.size() !== controllerHand.size()) {
                        addContinuousAtk(newControllerHand.size() * 300)
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

        const addContinuousDef = (value: number) => {
            const controllerHand = getFilteredCards(duel, {
                location: ['Hand'],
                controller: [card.getController().player],
            })
    
            duel.addCardFloodgate( `MODIFY_DEF`, {
                floodgateFilter: {
                    card: [card],
                },
                expiry: () => {
                    if(!includes(card.location.get(), "MZone")) return true
                    if(!includes(card.position.get(), "FaceUp")) return true
    
                    const newControllerHand = getFilteredCards(duel, {
                        location: ['Hand'],
                        controller: [card.getController().player],
                    })
                    if(newControllerHand.size() !== controllerHand.size()) {
                        addContinuousDef(newControllerHand.size() * 300)
                        return true;
                    }
                    return false
                },
                floodgateValue: {
                    value: value,
                    modifierId: `+DEF_${card.uid}`
                }
            })
        }

        const cardsInHand = getFilteredCards(duel, {
            location: ['Hand'],
            controller: [card.getController().player],
        })
        addContinuousAtk(cardsInHand.size() * 300)
        addContinuousDef(cardsInHand.size() * 300)
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