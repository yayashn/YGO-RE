import type { Card } from "server/duel/card"
import { getDuel } from "server/duel/duel"
import { CardEffect } from ".";
import NormalTrap from "server-storage/conditions/NormalTrap";
import { getCards, getFilteredCards } from "server/duel/utils";
import { includes } from "shared/utils";

/*
    Change all face-up Dragon-Type monsters on the field to Defense Position, 
    also they cannot change their battle positions.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

    const effect = () => {
        const checkEffectCondition = (card: Card) => {
            return getFilteredCards(duel, {
                location: ["MZone1", "MZone2", "MZone3", "MZone4", "MZone5"],
                type: ["Dragon"],
                controller: [controller.player]
            }).includes(card)
        }

        const cards = getCards(duel);

        const bindEffect = () => {
            cards.forEach(c => {
                if (checkEffectCondition(c)) {
                    if (c.position.get() === "FaceUpAttack") {
                        c.position.set("FaceUpDefense")
                    }

                    c.addFloodgate("CANNOT_CHANGE_POSITION", () => {
                        return !checkEffectCondition(c)
                            || card.position.get() !== "FaceUp"
                            || !includes(card.location.get(), "SZone")
                    })
                    c.addFloodgate("FORCE_DEFENSE_POSITION", () => {
                        return !checkEffectCondition(c)
                            || card.position.get() !== "FaceUp"
                            || !includes(card.location.get(), "SZone")
                    })
                }
            })
        }

        const connection = duel.changed.changed(() => {
            bindEffect()
        })

        card.changed.changed(() => {
            if (card.position.get() !== "FaceUp" || !includes(card.location.get(), "SZone")) {
                connection.Disconnect();
            }
        })
    }

    const effects: CardEffect[] = [
        {
            condition: () => NormalTrap(card),
            effect: () => effect(),
            location: ['SZone']
        }
    ]

    return effects
}