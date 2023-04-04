import { getCard, getFilteredCards, getTargets, pickTargets, setTargets, stringifyCards } from "server/utils";
import type { CardFolder, DuelFolder, PlayerValue } from "server/types";
import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from ".";

/*
    Target 2 Monster Cards from your opponent's Graveyard. Banish them.
*/
export default (card: CardFolder) => {
    const controller = card.controller.Value
    const duel = controller.Parent as DuelFolder

    const condition = () => {
        const targettableCards = getFilteredCards(duel, {
            location: ['GZone'],
            type: ['Monster'],
        })
        return targettableCards.size() >= 2
    }
    
    const target = () => {
        const targettableCards = getFilteredCards(duel, {
            location: ['GZone'],
            type: ['Monster'],
        })
        card.targets.Value = pickTargets(controller, 2, stringifyCards(targettableCards))
    }

    const effect = () => {
        const targets = getTargets(controller, card.targets.Value)
        targets.forEach(target => target.banish.Fire("FaceUp"))
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