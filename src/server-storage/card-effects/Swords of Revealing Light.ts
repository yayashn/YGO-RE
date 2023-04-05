import { getFilteredCards, getOpponent } from "server/utils";
import type { CardFolder, DuelFolder } from "server/types";
import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from ".";
import { addFloodgate } from "server/functions/floodgates";
import { HttpService } from "@rbxts/services";

/*
    After this card's activation, it remains on the field, 
    but you must destroy it during the End Phase of your opponent's 3rd turn. 
    When this card is activated: If your opponent controls a face-down monster,
    flip all monsters they control face-up. While this card is face-up on the
    field, your opponent's monsters cannot declare an attack.
*/
export default (card: CardFolder) => {
    const controller = card.controller.Value
    const duel = controller.Parent as DuelFolder
    const opponent = getOpponent(controller)

    const effect = () => {
        card.continuous.Value = true
        const removeFloodgate = addFloodgate(opponent, {
            floodgateUid: `SORL-${HttpService.GenerateGUID(false)}`,
            floodgateName: "disableAttack",
            floodgateCause: "Effect"
        })

        let opponentTurn = 0;
        const onPhaseChange = duel.phase.Changed.Connect((newPhase) => {
            if(duel.turnPlayer.Value === controller) return;
            if (newPhase === "EP") {
                opponentTurn += 1;
                if (opponentTurn === 3) {
                    card.destroy_.Fire("Effect")
                }
            }
        })

        const connections: RBXScriptConnection[] = []

        const onCardRemoved = () => {
            card.continuous.Value = false
            removeFloodgate()
            onPhaseChange.Disconnect()
            connections.forEach(connection => connection.Disconnect())
        }

        connections.push(card.position.Changed.Connect(onCardRemoved))
        connections.push(card.location.Changed.Connect(onCardRemoved))

        const faceDownMonsters = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            position: ['FaceDownDefense'],
            controller: [opponent]
        })
        faceDownMonsters.forEach(monster => monster.changePosition.Fire("FaceUpDefense"))
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