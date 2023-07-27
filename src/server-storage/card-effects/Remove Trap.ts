import type { Card } from "server/duel/card"
import { getDuel } from "server/duel/duel"
import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from ".";
import { getFilteredCards } from "server/duel/utils";

/*
    Target 1 face-up Trap Card on the field and destroy it.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

    const condition = () => {
        const targettableCards = getFilteredCards(duel, {
            location: ['SZone1', 'SZone2', 'SZone3', 'SZone4', 'SZone5'],
            type: ['Trap'],
            position: ['FaceUp']
        })
        return targettableCards.size() > 0
    }

    const target = () => {
        const targettableCards = getFilteredCards(duel, {
            location: ['SZone1', 'SZone2', 'SZone3', 'SZone4', 'SZone5'],
            type: ['Trap'],
            position: ['FaceUp']
        })
        controller.targettableCards.set(targettableCards);
        controller.targets.wait()
    }

    const effect = () => {
        const target = controller.targets.get()[0]
        target.destroy("Effect")
    }

    const effects: CardEffect[] = [
        {
            condition: () => NormalSpell(card) && condition(),
            target: () => target(),
            effect: () => effect(),
            location: ['SZone']
        }
    ]

    return effects
}