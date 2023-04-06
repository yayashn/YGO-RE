import { getCard, getFilteredCards, getTargets, pickTargets, setTargets, stringifyCards } from "server/utils";
import type { CardFolder, DuelFolder, PlayerValue } from "server/types";
import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from ".";

/*
    FLIP: Target 1 monster on the field; destroy that target.
*/
export default (card: CardFolder) => {
    const controller = card.controller.Value
    const duel = controller.Parent as DuelFolder
    
    const target = () => {
        const targettableCards = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
        })
        card.targets.Value = pickTargets(controller, 1, stringifyCards(targettableCards))
    }

    const effect = () => {
        const targets = getTargets(controller, card.targets.Value)
        targets[0].destroy_.Fire("Effect")
    }

    const effects: CardEffect[] = [
        {
            condition: () => false,
            target: () => target(),
            effect: () => effect(),
            location: ['SZone']
        }
    ]

    return effects
}