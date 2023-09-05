import type { Card } from "server/duel/card"
import { getDuel } from "server/duel/duel";
import { CardEffect } from "..";
import { includes } from "shared/utils";
import { Phase } from "server/duel/types";

/*
   
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
                    if(damageStep === "START" && duel.defendingCard.get() === card && !includes(duel.attackingCard.get()!.race.get(), "Machine")) {
                        const turn = duel.turn.get()
                        const monster = duel.attackingCard.get()
                        const connection2 = duel.phase.changed((phase: Phase) => {
                            if(phase === "EP" && duel.turn.get() === turn + 4) {
                                connection2.Disconnect()
                                monster!.destroy("Effect", card)
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