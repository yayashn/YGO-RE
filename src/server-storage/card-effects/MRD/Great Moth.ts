import type { Card } from "server/duel/card"
import NormalEffect from "server-storage/conditions/NormalEffect";
import { getDuel } from "server/duel/duel";
import { CardEffect } from "..";
import { getFilteredCards } from "server/duel/utils";
import waiting from "server/popups/waiting";
import { includes } from "shared/utils";
import pickPosition, { PickPosition, pickPositionSync } from "server/popups/PickPosition";

/*
    This monster cannot be Normal Summoned or Set. This card can only be Special Summoned
    by Tributing "Petit Moth" during your 4th turn after "Petit Moth" has been equipped 
    with "Cocoon of Evolution".
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

    const condition = () => {
        const cocoons = getFilteredCards(duel, {
            name: ["Cocoon of Evolution"],
            location: ["SZone1", "SZone2", "SZone3", "SZone4", "SZone5"],
            controller: [controller.player],
        })

        const cocoon = cocoons.find(c => {
            const turnEquipped = (c.getFloodgates("EQUIPPED")[0].floodgateValue as { turnEquipped: number }).turnEquipped;
            return duel.turn.get() - turnEquipped >= 4;
        })
        
        if(cocoon) {
            return "Special Summon"   
        }

        return false;
    }

    const cost = () => {
        const cocoons = getFilteredCards(duel, {
            name: ["Cocoon of Evolution"],
            location: ["SZone1", "SZone2", "SZone3", "SZone4", "SZone5"],
            controller: [controller.player],
        })

        const cocoon = cocoons.find(c => {
            const turnEquipped = (c.getFloodgates("EQUIPPED")[0].floodgateValue as { turnEquipped: number }).turnEquipped;
            return duel.turn.get() - turnEquipped >= 4;
        })
        
        if(cocoon) {
            const petitMoth = (cocoon.getFloodgates("EQUIPPED")[0].floodgateValue as { equipped: Card }).equipped;
            if(petitMoth.getController() === controller) {
                petitMoth.tribute()
                const location = controller.pickZone(duel.getEmptyFieldZones("MZone", controller.player, "Player"));
                const position = pickPositionSync(controller.player, card.art);
                card.specialSummon(location, position)
            }

            duel.addCardFloodgate("WAS_SPECIAL_SUMMONED", {
                floodgateFilter: {
                    card: [card],
                },
                expiry: () => {
                    return false
                }
            })
        }
    }

    const effects: CardEffect[] = [
        {
            condition: () => NormalEffect(card) && condition(),
            cost: () => cost(),
            restrictions: () => {
                const restrictionsList: string[] = ["CANNOT_NORMAL_SUMMON", "CANNOT_SET"];

                if(!card.hasFloodgate("WAS_SPECIAL_SUMMONED")) {
                    restrictionsList.push("CANNOT_SPECIAL_SUMMON")
                }

                return restrictionsList
            }
        }
    ]

    return effects
}