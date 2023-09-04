import type { Card } from "server/duel/card"
import { getDuel } from "server/duel/duel";
import { CardEffect } from "..";
import { getFilteredCards } from "server/duel/utils";

/*
    When this card inflicts Battle Damage to your opponent's Life Points, your opponent discards 1 card randomly from his/her hand.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!
    const opponent = duel.getOpponent(controller.player)

    const effect = async () => {
        const opponentHand: Card[] = getFilteredCards(duel, {
            location: ['Hand'],
            controller: [opponent.player]
        })

        if(opponentHand.size() === 0) return;
    
        const random = new Random()
        const randomCard = opponentHand[random.NextInteger(0, opponentHand.size() - 1)]
        randomCard.toGraveyard()
    }

    const effects: CardEffect[] = [
        {
            condition: () => false,
            effect: () => effect(),
            location: ['MZone'],
            trigger: 'INFLICTS_BATTLE_DAMAGE'
        }
    ]

    return effects
}