import type { Card } from "server/duel/card"
import { getDuel } from "server/duel/duel"
import { CardEffect } from "..";
import { includes } from "shared/utils";
import ContinuousTrap from "server-storage/conditions/ContinuousTrap";
import { getFilteredCards } from "server/duel/utils";

/*
    Each time a monster you control inflicts Battle Damage to your opponent, your opponent discards 1 random card.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!
    const opponent = duel.getOpponent(controller.player)

    const e = () => {
        const connections = [
            controller.inflictedBattleDamage.changed(() => {
                duel.addPendingEffect({
                    card: card,
                    effect: {effect: () => {
                        const opponentHand: Card[] = getFilteredCards(duel, {
                            location: ['Hand'],
                            controller: [opponent.player]
                        })
                
                        if(opponentHand.size() === 0) return;
                    
                        const random = new Random()
                        const randomCard = opponentHand[random.NextInteger(0, opponentHand.size() - 1)]
                        randomCard.toGraveyard()
                    }},
                    prediction: {}
                })
            }),
            card.position.changed((newPosition) => {
                if(!includes(newPosition, "FaceUp")) {
                    connections.forEach(c => c.Disconnect())
                };
            }),
            card.location.changed((newLocation) => {
                if(!includes(newLocation, "SZone")) {
                    connections.forEach(c => c.Disconnect())
                };
            })
        ]
    }

    const effects: CardEffect[] = [
        {
            effect: () => e(),
            condition: () => ContinuousTrap(card),
            location: ['SZone'],
        },
    ]

    return effects
}