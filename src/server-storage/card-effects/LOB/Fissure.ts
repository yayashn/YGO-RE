import type { Card } from "server/duel/card"
import { getDuel } from "server/duel/duel"
import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from "..";
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
            position: ['FaceUpAttack', 'FaceUpDefense'],
            controller: [duel.getOpponent(controller.player).player]
        })
        return targettableCards.size() > 0
    }

    const effect = () => {
        const targettableCards = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            type: ['Monster'],
            position: ['FaceUpAttack', 'FaceUpDefense'],
            controller: [duel.getOpponent(controller.player).player]
        })
        const lowestATK = targettableCards.reduce((lowest, card) => {
            return card.getAtk()! < lowest.getAtk()! ? card : lowest
        })
        
        const tiedCards = targettableCards.filter(card => card.getAtk() === lowestATK.getAtk())
        if (tiedCards.size() > 1) {
            const targets = controller.pickTargets(1, tiedCards)
            const target = targets[0]
            target.destroy("Effect", card)
        } else {
            lowestATK.destroy("Effect", card)
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