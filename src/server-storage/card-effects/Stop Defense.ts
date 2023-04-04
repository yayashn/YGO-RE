import { getCard, getFilteredCards, getTargets, pickTargets, setTargets, stringifyCards } from "server/utils";
import type { CardFolder, DuelFolder, PlayerValue } from "server/types";
import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from ".";

/*
    Target 1 Defense Position monster on your opponent's side of the field and change it to Attack Position.
*/
export default (card: CardFolder) => {
    const controller = card.controller.Value
    const duel = controller.Parent as DuelFolder

    const condition = () => {
        const targettableCards = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            type: ['Monster'],
            position: ['FaceUpDefense', 'FaceDownDefense']
        })
        return targettableCards.size() >= 1
    }
    
    const target = () => {
        const targettableCards = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            type: ['Monster'],
            position: ['FaceUpDefense', 'FaceDownDefense']
        })
        controller.targettableCards.Value = stringifyCards(targettableCards);
        card.targets.Value = pickTargets(controller, 1)
        controller.targettableCards.Value = ""
    }

    const effect = () => {
        const targets = getTargets(controller, card.targets.Value)
        targets[0].changePosition.Fire("FaceUpAttack")
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