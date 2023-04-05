import { getFilteredCards, getTargets, pickTargets, stringifyCards } from "server/utils";
import type { CardFolder, DuelFolder } from "server/types";
import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from ".";
import { includes } from "shared/utils";

/*
    A Dragon-Type monster equipped with this card increases its ATK and DEF by 300 points.
*/
const ATK = 300
const DEF = 300
const RACE = ["Dragon"]

export default (card: CardFolder) => {
    const controller = card.controller.Value
    const duel = controller.Parent as DuelFolder

    const condition = () => {
        const zombieCardOnField = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            type: ['Monster'],
            position: ['FaceUpDefense', 'FaceUpAttack'],
            race: RACE
        })
        return zombieCardOnField.size() > 0
    }

    const target = () => {
        const targettableCards = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            type: ['Monster'],
            position: ['FaceUpDefense', 'FaceUpAttack'],
            race: RACE
        })
        card.targets.Value = pickTargets(controller, 1, stringifyCards(targettableCards))
    }

    const effect = () => {
        const connections: RBXScriptConnection[] = []

        const target = getTargets(controller, card.targets.Value)[0]
        target.atk.Value += ATK
        target.def.Value += DEF

        const onCardRemoved = () => {
            connections.forEach(connection => connection.Disconnect())
            card.destroy_.Fire("Mechanic")
            if(target.atk.Value - ATK < 0) {
                target.atk.Value = 0
            } else {
                target.atk.Value -= ATK
            }
            if(target.def.Value - DEF < 0) {
                target.def.Value = 0
            } else {
                target.def.Value -= DEF
            }
            card.targets.Value = ""
        }

        connections.push(target.position.Changed.Connect(position => {
            if(includes(position, "FaceDown")) {
                onCardRemoved()
            }
        }))
        connections.push(target.location.Changed.Connect(location => {
            if(!includes(location, "MZone")) {
                onCardRemoved()
            }
        }))
        connections.push(card.position.Changed.Connect(onCardRemoved))
        connections.push(card.location.Changed.Connect(location => {
            if(!includes(location, "SZone")) {
                onCardRemoved()
            }
        }))
    }

    const effects: CardEffect[] = [
        {
            condition: () => NormalSpell(card) && condition(),
            effect: () => effect(),
            target: () => target(),
            location: ['SZone']
        }
    ]

    return effects
}