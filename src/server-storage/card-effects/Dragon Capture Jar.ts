import type { Card } from "server/duel/card"
import { getDuel } from "server/duel/duel"
import { CardEffect } from ".";
import { includes } from "shared/utils";
import ContinuousTrap from "server-storage/conditions/ContinuousTrap";

/*
    Change all face-up Dragon-Type monsters on the field to Defense Position, 
    also they cannot change their battle positions.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

    const effect = () => {
        duel.addCardFloodgate({
            floodgateName: "CANNOT_CHANGE_POSITION",
            floodgateFilter: {
                race: ["Dragon"],
                location: ["MZone1", "MZone2", "MZone3", "MZone4", "MZone5"],
                position: ["FaceUpAttack", "FaceUpDefense"],
            },
            expiry: () => {
                return !includes(card.location.get(), "SZone") || card.position.get() !== "FaceUp"
            }
        })

        duel.addCardFloodgate({
            floodgateName: "FORCE_FACEUP_DEFENSE",
            floodgateFilter: {
                race: ["Dragon"],
                location: ["MZone1", "MZone2", "MZone3", "MZone4", "MZone5"],
                position: ["FaceUpAttack", "FaceUpDefense"],
            },
            expiry: () => {
                return !includes(card.location.get(), "SZone") || card.position.get() !== "FaceUp"
            }
        })
    }

    const effects: CardEffect[] = [
        {
            condition: () => ContinuousTrap(card),
            effect: () => effect(),
            location: ['SZone']
        }
    ]

    return effects
}