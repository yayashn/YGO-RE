import type { Card } from "server/duel/card"
import { getDuel } from "server/duel/duel"
import { CardEffect } from "..";
import NormalTrap from "server-storage/conditions/NormalTrap";
import { includes } from "shared/utils";

/*
    Activate only when your opponent activates a Spell, Trap, or Effect Monster's 
    effect that would destroy a Trap Card(s) you control. Destroy this card instead.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

    const condition = () => {
        try {
            const cardsToBeDestroyed = duel.getLastAction()!.prediction["destroy"] as Card[]
            const trapsToBeDestroyedInControl = cardsToBeDestroyed.filter((card) => {
                return includes(card.type.get(), "Trap") && card.getController() === controller
            })
            return trapsToBeDestroyedInControl.size() > 0
        } catch {
            return false
        }
    }

    const effect = () => {
        const currentChain = duel.chain.get()
        const target = duel.getSecondLastAction()?.cards[0];
        const cardsToBeDestroyed = duel.getSecondLastAction()!.prediction["destroy"] as Card[]
        const trapsToBeDestroyedInControl = cardsToBeDestroyed.filter((card) => {
            return includes(card.type.get(), "Trap") && card.getController() === controller
        });

        trapsToBeDestroyedInControl.forEach(async (c) => {
            c.reveal()
        })

        duel.addCardFloodgate("CANNOT_BE_DESTROYED_BY", {
            floodgateFilter: {
                card: trapsToBeDestroyedInControl
            },
            floodgateValue: {
                target: target
            },
            expiry: () => {
                return currentChain !== duel.chain.get()
            }
        })
        card.destroy("Effect", card)
    }

    const effects: CardEffect[] = [
        {
            condition: () => {
                return NormalTrap(card) && condition()
            },
            effect: () => effect(),
            location: ['SZone'],
        }
    ]

    return effects
}