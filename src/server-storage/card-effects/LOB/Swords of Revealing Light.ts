import type { Card } from "server/duel/card"
import { getDuel } from "server/duel/duel"
import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from "..";
import { includes } from "shared/utils";
import { getFilteredCards } from "server/duel/utils";

/*
    After this card's activation, it remains on the field, 
    but you must destroy it during the End Phase of your opponent's 3rd turn. 
    When this card is activated: If your opponent controls a face-down monster,
    flip all monsters they control face-up. While this card is face-up on the
    field, your opponent's monsters cannot declare an attack.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!
    const opponent = duel.getOpponent(controller.player)

    const expiration = (turn: number) => {
        return (duel.turn.get() >= turn + 6 && duel.phase.get() === "EP") || card.position.get() !== "FaceUp" || !includes(card.location.get(), "SZone")
    }

    const effect = () => {
        const turn = duel.turn.get()
        duel.addCardFloodgate("CONTINUOUS", {
            floodgateFilter: {
                card: [card],
            },
            expiry: () => {
                if(expiration(turn)) {
                    card.destroy("Effect")
                    return true
                }
                return false
            }
        })

        const faceDownMonsters = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            position: ['FaceDownDefense'],
            controller: [opponent.player]
        })
        faceDownMonsters.forEach(monster => monster.changePosition("FaceUpDefense"))

        duel.addCardFloodgate( "CANNOT_ATTACK", {
            floodgateFilter: {
                location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
                controller: [opponent.player]
            },
            expiry: () => expiration(turn)
        })
    }

    const effects: CardEffect[] = [
        {
            condition: () => NormalSpell(card) && card.position.get() !== "FaceUp",
            effect: () => effect(),
            location: ['SZone']
        }
    ]

    return effects
}