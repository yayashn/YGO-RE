import type { Card } from "server/duel/card"
import { getDuel } from "server/duel/duel";
import { CardEffect } from "..";
import { getFilteredCards } from "server/duel/utils";

/*
    When this card is changed from Defense Position to Attack Position, return 1 monster 
    on your opponent's side of the field to the owner's hand.
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
            target.toHand()
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
            trigger: 'DEFENSE_TO_ATTACK'
        }
    ]

    return effects
}