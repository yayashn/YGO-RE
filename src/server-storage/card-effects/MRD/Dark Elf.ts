import type { Card } from "server/duel/card"
import { getDuel } from "server/duel/duel";
import { CardEffect } from "..";
import { getFilteredCards } from "server/duel/utils";

/*
    This card requires a cost of 1000 of your own Life Points to attack.
*/
export default (card: Card) => {
    const controller = card.getController()

    const effects: CardEffect[] = [
        {
            attackCost: () => {
                if(controller.lifePoints.get() < 1000) return false
                controller.changeLifePoints(-1000)
            },
            restrictions: () => {
                const restrictionsList: string[] = [];
                if(card.getController().lifePoints.get() < 1000) {
                    restrictionsList.push("CANNOT_ATTACK")
                }

                return restrictionsList
            }
        }
    ]

    return effects
}