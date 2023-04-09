import { getFilteredCards, getTargets, pickTargets, stringifyCards, pickZoneSync, pickPositionSync } from "server/utils";
import type { CardFolder, DuelFolder } from "server/types";
import NormalSpell from "server-storage/conditions/NormalSpell";
import monsterMaterials, { CardEffect } from "./materials";
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
            location: ["EZone"],
            controller: [controller]
        })

        return extraDeck.filter(fusion => {
            const materials = monsterMaterials[fusion.Name](fusion)[0].fusionMaterials!
            
            return Object.entries(materials).every(([materialName, materialsRequired]) => {
                return getFilteredCards(duel, {
                    location: ["MZone1", "MZone2", "MZone3", "MZone4", "MZone5", "Hand"],
                    Name: [materialName],
                    controller: [controller]
                }).size() >= materialsRequired
            })
        })
    }

    const target = () => {
        card.targets.Value = pickTargets(controller, 1, stringifyCards(getEligibleFusionMonsters()))
    }

    const condition = () => {
        return getEligibleFusionMonsters().size() > 0
    }
    
    const effect = () => {
        if(card.targets.Value === "") return;

        const fusionMonster = getTargets(controller, card.targets.Value)[0]
        const materials = monsterMaterials[fusionMonster.Name](fusionMonster)[0].fusionMaterials!
        
        let chosenMaterials: CardFolder[] = []
        Object.entries(materials).forEach(([materialName, materialsRequired]) => {
            const material = getFilteredCards(duel, {
                location: ["MZone1", "MZone2", "MZone3", "MZone4", "MZone5", "Hand"],
                Name: [materialName],
                controller: [controller]
            })
            const pickedMaterials = getTargets(controller, pickTargets(controller, materialsRequired, stringifyCards(material)))
            chosenMaterials = [...chosenMaterials, ...pickedMaterials]
        })

        chosenMaterials.forEach(material => {
            material.toGraveyard.Fire()
        })

        const zone = pickZoneSync(controller);
        const position = pickPositionSync(controller, fusionMonster);
        fusionMonster.controller.Value = controller
        fusionMonster.specialSummon.Fire(zone, position)
        card.targets.Value = ""
    }

    const effects: CardEffect[] = [
        {
            condition: () => NormalSpell(card) && condition(),
            target: target,
            effect: () => effect(),
            location: ['SZone']
        }
    ]

    return effects
}