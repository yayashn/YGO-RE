import type { Card } from "server/duel/card"
import { CardEffect } from "..";
import { getFilteredCards } from "server/duel/utils";
import { getDuel } from "server/duel/duel";

/*
    If this card is sent from the field to the GY: Add 1 monster with 1500 or less ATK 
    from your Deck to your hand, but you cannot activate cards, or the effects of cards, 
    with that name for the rest of this turn. You can only use this effect of "Sangan" once per turn.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

    const effect = async () => {
        const HOTP = controller.getFloodgates("HOTP")?.some(f => f.value === "Sangan");
        if(HOTP) return;

        const targets = getFilteredCards(duel, {
            location: ['Deck'],
            controller: [controller.player],
            atk: [`<=1500`]
        })

        if(targets.size() === 0) return;

        const target = controller.pickTargets(1, targets)[0];
        target.location.set('Hand')

        const turn = duel.turn.get()
        controller.addFloodgate(`HOTP`, () => {
            return duel.turn.get() !== turn
        }, undefined, "Sangan")
        controller.addFloodgate(`CANNOT_ACTIVATE_CARD`, () => {
            return duel.turn.get() !== turn
        }, undefined, target.name.get())
        controller.addFloodgate(`CANNOT_ACTIVATE_EFFECT`, () => {
            return duel.turn.get() !== turn
        }, undefined, {
            cardName: target.name.get()
        })
    }

    const effects: CardEffect[] = [
        {
            condition: () => false,
            effect: () => effect(),
            trigger: 'SENT_FROM_FIELD_TO_GY'
        }
    ]

    return effects
}