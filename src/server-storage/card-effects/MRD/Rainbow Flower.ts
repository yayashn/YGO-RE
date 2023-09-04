import type { Card } from "server/duel/card"
import NormalEffect from "server-storage/conditions/NormalEffect";
import { getDuel } from "server/duel/duel";
import { CardEffect } from "..";
import { getFilteredCards } from "server/duel/utils";
import options from "server/popups/options";
import waiting from "server/popups/waiting";
import { includes } from "shared/utils";

/*
    This monster can attack your opponent's Life Points directly.
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
        if(card.hasFloodgate("CAN_DIRECT_ATTACK")) return
        duel.addCardFloodgate(`CAN_DIRECT_ATTACK`, {
            floodgateFilter: {
                card: [card],
            }, 
            expiry: () => {
                return !condition()
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