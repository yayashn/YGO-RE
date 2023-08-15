import type { Card } from "server/duel/card"
import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from "..";
import { getFilteredCards } from "server/duel/utils";
import { getDuel } from "server/duel/duel";

/*
  If you have "Right Leg of the Forbidden One", "Left Leg of the Forbidden One", "Right Arm of the Forbidden One" 
  and "Left Arm of the Forbidden One" in addition to this card in your hand, you win the Duel.  
*/

const pieces = [
    "Right Leg of the Forbidden One",
    "Left Leg of the Forbidden One",
    "Right Arm of the Forbidden One",
    "Left Arm of the Forbidden One"
]

export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!;

    const exodia = () => {
        if(card.location.get() !== "Hand") return false;

        const hand = getFilteredCards(duel, {
            location: ['Hand'],
            controller: [controller.player],
        })
        const allPiecesInHand = pieces.every(piece => hand.find(c => c.name.get() === piece) !== undefined)

        if(allPiecesInHand) {
            duel.endDuel(controller, `Won by the effect of Exodia the Forbidden One.`)
        }

        return false;
    }

    const effects: CardEffect[] = [
        {
            condition: () => false,
            effect: () => exodia(),
            location: ['Hand']
        }
    ]

    return effects
}