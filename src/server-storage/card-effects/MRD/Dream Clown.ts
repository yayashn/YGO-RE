import type { Card } from "server/duel/card"
import { getDuel } from "server/duel/duel";
import { CardEffect } from "..";
import { getFilteredCards } from "server/duel/utils";

/*
    If this Attack Position card is changed to face-up Defense Position: 
    Target 1 monster your opponent controls; destroy that target.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!
    const opponent = duel.getOpponent(controller.player)

    const target = () => {
        const opponentMZone: Card[] = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            controller: [opponent.player]
        })

        if(opponentMZone.size() === 0) return;

        const target = controller.pickTargets(1, opponentMZone)[0]

        card.targets.set([target])
    }

    const effect = async () => {
        try {
            const target = card.targets.get()[0]
            target.destroy("Effect", card)
        } catch {
            print("No target")
        }
    }

    const effects: CardEffect[] = [
        {
            condition: () => false,
            target: () => target(),
            effect: () => effect(),
            location: ['MZone'],
            trigger: 'ATTACK_TO_DEFENSE'
        }
    ]

    return effects
}