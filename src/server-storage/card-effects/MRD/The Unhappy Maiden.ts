import type { Card } from "server/duel/card"
import { CardEffect } from "..";
import { getFilteredCards } from "server/duel/utils";
import { getDuel } from "server/duel/duel";

/*
    When this card is sent to the Graveyard as a result of battle, the Battle Phase for that turn ends immediately.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

    const effect = async () => {
       duel.handlePhase("MP2")
    }

    const effects: CardEffect[] = [
        {
            condition: () => false,
            effect: () => effect(),
            trigger: 'SENT_FROM_FIELD_TO_GY_BATTLE'
        }
    ]

    return effects
}