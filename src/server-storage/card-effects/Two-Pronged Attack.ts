import { getFilteredCards, getOpponent, getTargets, pickTargets, stringifyCards } from "server/utils";
import type { CardFolder, DuelFolder } from "server/types";
import { CardEffect } from ".";
import NormalTrap from "server-storage/conditions/NormalTrap";

/*
    Target and destroy 2 of your monsters and 1 of your opponent's monsters.
*/
export default (card: CardFolder) => {
    const controller = card.controller.Value
    const duel = controller.Parent as DuelFolder
    const opponent = getOpponent(controller)

    const condition = () => {
        const controllerMonsters = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            type: ['Monster'],
            controller: [controller]
        })
        const opponentMonsters = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            type: ['Monster'],
            controller: [opponent]
        })

        return controllerMonsters.size() >= 2 && opponentMonsters.size() >= 1
    }
    
    const target = () => {
        const controllerMonsters = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            type: ['Monster'],
            controller: [controller]
        })
        const opponentMonsters = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            type: ['Monster'],
            controller: [opponent]
        })

        const controllerMonsterTargetUids = pickTargets(controller, 2, stringifyCards(controllerMonsters));
        controller.targets.Value = ""
        const opponentMonsterTargetUids = pickTargets(controller, 1, stringifyCards(opponentMonsters));
        const allTargetUids = [...controllerMonsterTargetUids.split(","), ...opponentMonsterTargetUids.split(",")]
        card.targets.Value = allTargetUids.join(',')
    }

    const effect = () => {
        const targets = getTargets(controller, card.targets.Value)
        targets.forEach(target => {
            target.destroy_.Fire("Effect")
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