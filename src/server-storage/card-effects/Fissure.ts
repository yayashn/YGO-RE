import { getCard, getFilteredCards, stringifyCards } from "server/utils";
import type { CardFolder, DuelFolder } from "server/types";
import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from ".";

/*
    Destroy the 1 face-up monster your opponent controls that has the lowest ATK (your choice, if tied).
*/
export default (card: CardFolder) => {
    const controller = card.controller.Value
    const duel = controller.Parent as DuelFolder

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
            return card.atk.Value < lowest.atk.Value ? card : lowest
        })
        const tiedCards = targettableCards.filter(card => card.atk.Value === lowestATK.atk.Value)
        if (tiedCards.size() > 1) {
            controller.targettableCards.Value = stringifyCards(tiedCards);
            controller.targets.Changed.Wait()
            const target = controller.targets.Value.split(",")[0]
            getCard(duel, target)!.destroy_.Fire("Effect")
        } else {
            lowestATK.destroy_.Fire("Effect")
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