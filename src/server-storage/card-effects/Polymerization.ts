import type { Card } from "server/duel/card"
import { getDuel } from "server/duel/duel"
import NormalSpell from "server-storage/conditions/NormalSpell";
import monsterMaterials, { CardEffect } from "./materials";
import Object from "@rbxts/object-utils";
import { getFilteredCards } from "server/duel/utils";
import pickPosition from "server/popups/PickPosition";

/*
    Fusion Summon 1 Fusion Monster from your Extra Deck, using monsters 
    from your hand or field as Fusion Material.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

    const getEligibleFusionMonsters = () => {
        const extraDeck = getFilteredCards(duel, {
            location: ["EZone"],
            controller: [controller.player]
        })

        return extraDeck.filter(fusion => {
            const materials = monsterMaterials[fusion.name.get()](fusion)[0].fusionMaterials!
            
            return Object.entries(materials).every(([materialName, materialsRequired]) => {
                return getFilteredCards(duel, {
                    location: ["MZone1", "MZone2", "MZone3", "MZone4", "MZone5", "Hand"],
                    name: [materialName],
                    controller: [controller.player]
                }).size() >= materialsRequired
            })
        })
    }

    const target = () => {
        controller.pickTargets(1, getEligibleFusionMonsters())
    }

    const condition = () => {
        return getEligibleFusionMonsters().size() > 0
    }
    
    const effect = async () => {
        if(card.targets.get().size() === 0) return;

        const fusionMonster = controller.targets.get()[0]
        const materials = monsterMaterials[fusionMonster.name.get()](fusionMonster)[0].fusionMaterials!
        
        let chosenMaterials: Card[] = []
        Object.entries(materials).forEach(([materialName, materialsRequired]) => {
            const material = getFilteredCards(duel, {
                location: ["MZone1", "MZone2", "MZone3", "MZone4", "MZone5", "Hand"],
                name: [materialName],
                controller: [controller.player]
            })
            const pickedMaterials = controller.pickTargets(materialsRequired, material)
            chosenMaterials = [...chosenMaterials, ...pickedMaterials]
        })

        chosenMaterials.forEach(material => {
            material.toGraveyard()
        })

        const zone = duel.pickZone(controller);
        const position = await pickPosition(controller.player, fusionMonster.art);
        fusionMonster.controller.set(controller.player)
        fusionMonster.specialSummon(zone, position)
        card.targets.set([])
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