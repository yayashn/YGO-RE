import { getCard, getFilteredCards, stringifyCards } from "server/utils";
import type { CardFolder, DuelFolder } from "server/types";
import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from ".";

/*
    Target 1 face-up Trap Card on the field and destroy it.
*/
export default (card: CardFolder) => {
    const controller = card.controller.Value
    const duel = controller.Parent as DuelFolder

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
        controller.targettableCards.Value = stringifyCards(targettableCards);
        controller.targets.Changed.Wait()
    }

    const effect = () => {
        const target = controller.targets.Value.split(",")[0]
        getCard(duel, target)!.destroy_.Fire("Effect")
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