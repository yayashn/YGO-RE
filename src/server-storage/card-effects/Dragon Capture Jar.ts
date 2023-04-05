import { getFilteredCards, getOpponent } from "server/utils";
import type { CardFolder, DuelFolder } from "server/types";
import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from ".";
import { addFloodgate } from "server/functions/floodgates";
import { HttpService } from "@rbxts/services";

/*
    Change all face-up Dragon-Type monsters on the field to Defense Position, 
    also they cannot change their battle positions.
*/
export default (card: CardFolder) => {
    const controller = card.controller.Value
    const duel = controller.Parent as DuelFolder
    const opponent = getOpponent(controller)

    const effect = () => {
        const removeDisableChangePositionFloodgate = addFloodgate(opponent, {
            floodgateUid: `DCJ-${HttpService.GenerateGUID(false)}`,
            floodgateName: "disableChangePosition",
            floodgateCause: "Effect"
        })
        const removeForceDefenseFloodgate = addFloodgate(opponent, {
            floodgateUid: `DCJ-${HttpService.GenerateGUID(false)}`,
            floodgateName: "forceDefense",
            floodgateCause: "Effect"
        })
        
        const connections: RBXScriptConnection[] = []

        const onCardRemoved = () => {
            removeDisableChangePositionFloodgate()
            removeForceDefenseFloodgate()
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