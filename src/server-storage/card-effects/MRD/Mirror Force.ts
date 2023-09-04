import type { Card } from "server/duel/card"
import { getDuel } from "server/duel/duel"
import { CardEffect } from "..";
import { includes } from "shared/utils";
import NormalTrap from "server-storage/conditions/NormalTrap";
import { getFilteredCards } from "server/duel/utils";

/*
    When an opponent's monster declares an attack: Destroy all your opponent's Attack Position monsters.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!
    const opponent = duel.getOpponent(controller.player)

    const condition = () => {
        const action = duel.getLastAction()

        if(action === undefined) return false;
        if(action.cards === undefined) return false;
        if(action.player === controller) return false;

        return includes(action.action, "Attack")
    }

    const effect = () => {
        const targets = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            position: ['FaceUpAttack'],
            controller: [opponent.player]
        })

        targets.forEach(target => {
            target.destroy("Effect", card)
        })
    }

    const effects: CardEffect[] = [
        {
            condition: () => {
                return NormalTrap(card) && condition()
            },
            effect: () => effect(),
            location: ['SZone'],
        }
    ]

    return effects
}