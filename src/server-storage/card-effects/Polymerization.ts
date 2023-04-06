import { getFilteredCards, getTargets, pickTargets, pickZone, pickPosition, stringifyCards } from "server/utils";
import type { CardFolder, DuelFolder } from "server/types";
import NormalSpell from "server-storage/conditions/NormalSpell";
import cardEffects, { CardEffect } from ".";
import Object from "@rbxts/object-utils";

/*
    Fusion Summon 1 Fusion Monster from your Extra Deck, using monsters 
    from your hand or field as Fusion Material.
*/
export default (card: CardFolder) => {
    const controller = card.controller.Value
    const duel = controller.Parent as DuelFolder

    const getEligibleFusionMonsters = () => {
        const extraDeck = getFilteredCards(duel, {
            location: ["EZone"]
        })

        return extraDeck.filter(fusion => {
            const materials = cardEffects[fusion.Name](fusion)[0].fusionMaterials!
            
            return Object.entries(materials).every(([materialName, materialsRequired]) => {
                return getFilteredCards(duel, {
                    location: ["MZone1", "MZone2", "MZone3", "MZone4", "MZone5", "Hand"],
                    Name: [materialName],
                    controller: [controller]
                }).size() >= materialsRequired
            })
        })
    }

    const condition = () => {
        return getEligibleFusionMonsters().size() > 0
    }
    
    const effect = async () => {
        const targets = getTargets(controller, pickTargets(controller, 1, stringifyCards(getEligibleFusionMonsters())))
        const zone = await pickZone(controller);
        const position = await pickPosition(controller, targets[0]);
        targets[0].controller.Value = controller
        targets[0].specialSummon.Fire(zone, position)
    }

    const effects: CardEffect[] = [
        {
            condition: () => NormalSpell(card) && condition(),
            effect: () => effect(),
            location: ['SZone']
        }
    ]

    return effects
}