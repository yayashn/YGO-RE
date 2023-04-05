import { getFilteredCards } from "server/utils";
import type { CardFolder, DuelFolder } from "server/types";
import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from ".";
import { addCardFloodgate } from "server/functions/floodgates";
import { HttpService } from "@rbxts/services";
import { includes } from "shared/utils";

/*
    Change all face-up Dragon-Type monsters on the field to Defense Position, 
    also they cannot change their battle positions.
*/
export default (card: CardFolder) => {
    const controller = card.controller.Value
    const duel = controller.Parent as DuelFolder

    const effect = () => {
        const uid = `DCJ-${HttpService.GenerateGUID(false)}`
        const removeDisableChangePositionFloodgate = addCardFloodgate(card, {
            floodgateUid: uid,
            floodgateName: "disableChangePosition",
            floodgateCause: "Effect",
            floodgateFilter: {
                race: ["Dragon"],
                location: ["MZone1", "MZone2", "MZone3", "MZone4", "MZone5"],
            }
        });
        const removeForceDefensePositionFloodgate = addCardFloodgate(card, {
            floodgateUid: uid,
            floodgateName: "forceFaceUpDefensePosition",
            floodgateCause: "Effect",
            floodgateFilter: {
                race: ["Dragon"],
                location: ["MZone1", "MZone2", "MZone3", "MZone4", "MZone5"],
                position: ["FaceUpAttack"]
            }
        })
        
        const connections: RBXScriptConnection[] = []

        const onCardRemoved = () => {
            removeDisableChangePositionFloodgate()
            removeForceDefensePositionFloodgate()
            connections.forEach(connection => connection.Disconnect())
        }

        connections.push(card.position.Changed.Connect(onCardRemoved))
        connections.push(card.location.Changed.Connect(location => {
            if(!includes(location, "SZone")) {
                onCardRemoved()
            }
        }))

        const faceDownMonsters = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            position: ['FaceUpAttack'],
            race: ["Dragon"]
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