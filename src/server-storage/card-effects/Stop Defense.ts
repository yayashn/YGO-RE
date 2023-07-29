import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from ".";
import { Card } from "server/duel/card";
import { getDuel } from "server/duel/duel";
import { getFilteredCards } from "server/duel/utils";

/*
    Target 1 Defense Position monster on your opponent's side of the field and change it to Attack Position.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

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
        card.targets.set(controller.pickTargets(1, targettableCards))
    }

    const effect = () => {
        const targets = card.targets.get()
        targets[0].changePosition("FaceUpAttack")
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