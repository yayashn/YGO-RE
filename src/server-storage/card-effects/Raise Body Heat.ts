import { getFilteredCards } from "server/duel/utils";
import type { Card } from "server/duel/card"
import { getDuel } from "server/duel/duel"
import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from ".";
import { includes } from "shared/utils";
import { Position } from "server/duel/types";

/*
A Dinosaur-Type monster equipped with this card increases its ATK and DEF by 300 points.
*/
const ATK = 300
const DEF = 300
const RACE = ["Dinosaur"]

export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

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
        controller.pickTargets(1, targettableCards)
    }

    const effect = () => {
        const connections: RBXScriptConnection[] = []

        const target = card.targets.get()[0]
target.atk.set(target.atk.get()! + ATK)
        target.def.set(target.def.get()! + DEF)

        const onCardRemoved = () => {
            connections.forEach(connection => connection.Disconnect())
            card.destroy("Mechanic")
            if(target.atk.get()! - ATK < 0) {
                target.atk.set(0)
            } else {
                target.atk.set(target.atk.get()! - ATK)
            }
            if(target.def.get()! - DEF < 0) {
                target.def.set(0)
            } else {
                target.def.set(target.def.get()! - DEF)
            }
            card.targets.set([])
        }

        connections.push(target.position.changed((position: Position) => {
            if(includes(position, "FaceDown")) {
                onCardRemoved()
            }
        }))
        connections.push(target.location.changed(location => {
            if(!includes(location, "MZone")) {
                onCardRemoved()
            }
        }))
        connections.push(card.position.changed(onCardRemoved))
        connections.push(card.location.changed(location => {
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