import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from "..";
import type { Card } from "server/duel/card";
import { getDuel } from "server/duel/duel";
import { getFilteredCards } from "server/duel/utils";

/*
    Switch the original ATK and DEF of all face-up monsters currently on the field, until the end of this turn.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

    const effect = () => {
        const monstersInMZone = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            position: ['FaceUpAttack', 'FaceUpDefense']
        })

        monstersInMZone.forEach(monster => {
            const atk = monster.atk.get()
            const def = monster.def.get()

            monster.atk.set(def)
            monster.def.set(atk)

            const connection = duel.turn.changed(() => {
                connection.Disconnect()
                monster.atk.set(atk)
                monster.def.set(def)
            })
        })
    }

    const condition = () => {
        const monstersInMZone = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            position: ['FaceUpAttack', 'FaceUpDefense']
        })
        return monstersInMZone.size() > 0
    }

    const effects: CardEffect[] = [
        {
            condition: () => NormalSpell(card) && condition(),
            effect: () => effect(),
            location: ['SZone']
        }
    ]

    return effects
}