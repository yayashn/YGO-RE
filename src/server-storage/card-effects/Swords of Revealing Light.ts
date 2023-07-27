import type { Card } from "server/duel/card"
import { getDuel } from "server/duel/duel"
import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from ".";
import { HttpService } from "@rbxts/services";
import { includes } from "shared/utils";
import { getCards, getFilteredCards } from "server/duel/utils";

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

    const effect = () => {
        const turn = duel.turn.get()
        card.addFloodgate("CONTINUOUS", () => {
            return (duel.turn.get() >= turn + 5 && duel.phase.get() === "EP") || card.position.get() !== "FaceUp" || includes(card.location.get(), "SZone")
        })

        const faceDownMonsters = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            position: ['FaceDownDefense'],
            controller: [opponent.player]
        })
        faceDownMonsters.forEach(monster => monster.changePosition("FaceUpDefense"))

        const cards = getCards(duel);
        const bindEffect = () => {
            cards.forEach(c => {
                if (c.controller.get() === opponent.player && c.type.get() === "Monster") {
                    c.addFloodgate("CANNOT_ATTACK", () => {
                        return (duel.turn.get() >= turn + 5 && duel.phase.get() === "EP") || card.position.get() !== "FaceUp" || includes(card.location.get(), "SZone")
                    })
                }
            })
        }

        const connections = [
            duel.changed.changed(() => {
                bindEffect()
            })
        ]

        cards.forEach(c => {
            connections.push(c.changed.changed(() => {
                bindEffect()
            }))
        })
    }

    const effects: CardEffect[] = [
        {
            condition: () => NormalSpell(card),
            effect: () => effect(),
            location: ['SZone']
        }
    ]

    return effects
}