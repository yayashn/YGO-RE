import type { Card } from "server/duel/card"
import { getDuel } from "server/duel/duel";
import { CardEffect } from "..";
import { includes } from "shared/utils";
import { Phase } from "server/duel/types";

/*
   A non Zombie-Type monster attacking "Electric Lizard" cannot attack on its following turn.
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
        const connections = [
            duel.damageStep.changed((damageStep: string) => {
                try {
                    if((damageStep === "START" || damageStep === "DURING") && duel.defendingCard.get() === card && !includes(duel.attackingCard.get()!.race.get(), "Zombie")) {
                        const turn = duel.turn.get()
                        duel.addCardFloodgate(`CANNOT_ATTACK`, {
                            floodgateFilter: {
                                card: [duel.attackingCard.get()!]
                            },
                            expiry: () => {
                                print('expiring', duel.turn.get() !== turn + 3)
                                return duel.turn.get() >= turn + 3
                            }
                        })
                    }
                } catch{}
            }),
            duel.changed.changed(() => {
                if(!condition()) {
                    connections.forEach(c => c.Disconnect())
                }
            })
        ]
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