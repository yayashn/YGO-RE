import type { Card } from "server/duel/card"
import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from "..";
import { getDuel } from "server/duel/duel";

/*
    Inflict 600 damage to your opponent.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!
    const opponent = duel.getOpponent(controller.player)

    const effects: CardEffect[] = [
        {
            condition: () => NormalSpell(card),
            effect: () => opponent.changeLifePoints(-600),
            location: ['SZone']
        }
    ]

    return effects
}