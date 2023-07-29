import type { Card } from "server/duel/card"
import { getDuel } from "server/duel/duel"
import { CardEffect } from ".";
import NormalTrap from "server-storage/conditions/NormalTrap";
import { getFilteredCards } from "server/duel/utils";

/*
    Target and destroy 2 of your monsters and 1 of your opponent's monsters.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!
    const opponent = duel.getOpponent(controller.player)

    const condition = () => {
        const controllerMonsters = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            type: ['Monster'],
            controller: [controller.player]
        })
        const opponentMonsters = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            type: ['Monster'],
            controller: [opponent.player]
        })

        return controllerMonsters.size() >= 2 && opponentMonsters.size() >= 1
    }
    
    const target = () => {
        const controllerMonsters = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            type: ['Monster'],
            controller: [controller.player]
        })
        const opponentMonsters = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            type: ['Monster'],
            controller: [opponent.player]
        })

        const controllerMonsterTarget = controller.pickTargets(2, controllerMonsters);
        controller.targets.set([])
        const opponentMonsterTarget = controller.pickTargets(1, opponentMonsters);
        controller.targets.set([])
        const allTargets = [...controllerMonsterTarget, ...opponentMonsterTarget]
        card.targets.set(allTargets)
    }

    const effect = () => {
        const targets = card.targets.get()
        targets.forEach(target => {
            target.destroy("Effect")
        })
    }

    const effects: CardEffect[] = [
        {
            condition: () => NormalTrap(card) && condition(),
            target: () => target(),
            effect: () => effect(),
            location: ['SZone']
        }
    ]

    return effects
}