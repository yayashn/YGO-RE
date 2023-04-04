import { getCard, getFilteredCards, getTargets, pickTargets, pickZone, pickPosition, setTargets, stringifyCards } from "server/utils";
import type { CardFolder, DuelFolder, PlayerValue } from "server/types";
import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from ".";

/*
    Target 1 monster in either GY; Special Summon it.
*/
export default (card: CardFolder) => {
    const controller = card.controller.Value
    const duel = controller.Parent as DuelFolder

    const condition = () => {
        const targettableCards = getFilteredCards(duel, {
            location: ['GZone'],
            type: ['Monster'],
        })
        return targettableCards.size() >= 1
    }
    
    const target = () => {
        const targettableCards = getFilteredCards(duel, {
            location: ['GZone'],
            type: ['Monster'],
        })
        card.targets.Value = pickTargets(controller, 1, stringifyCards(targettableCards))
    }

    const effect = async () => {
        const targets = getTargets(controller, card.targets.Value)
        const zone = await pickZone(controller);
        const position = await pickPosition(controller, targets[0]);
        targets[0].controller.Value = controller
        targets[0].specialSummon.Fire(zone, position)
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