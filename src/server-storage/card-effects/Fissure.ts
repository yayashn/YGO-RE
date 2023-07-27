import type { Card } from "server/duel/card"
import { getDuel } from "server/duel/duel"
import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from ".";
import { getFilteredCards } from "server/duel/utils";

/*
    Destroy the 1 face-up monster your opponent controls that has the lowest ATK (your choice, if tied).
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

    const condition = () => {
        const targettableCards = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            type: ['Monster'],
            position: ['FaceUp']
        })
        return targettableCards.size() > 0
    }

    const effect = () => {
        const targettableCards = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            type: ['Monster'],
            position: ['FaceUp']
        })
        const lowestATK = targettableCards.reduce((lowest, card) => {
            return card.atk.get()! < lowest.atk.get()! ? card : lowest
        })
        const tiedCards = targettableCards.filter(card => card.atk.get() === lowestATK.atk.get())
        if (tiedCards.size() > 1) {
            controller.targettableCards.set(tiedCards)
            controller.targets.wait()
            const target = controller.targets.get()[0]
            target.destroy("Effect")
        } else {
            lowestATK.destroy("Effect")
        }
    }

    const effects: CardEffect[] = [
        {
            condition: () => NormalSpell(card) && condition(),
            effect: () => effect(),
            location: ['SZone']
        }
    ]

    return effects
}