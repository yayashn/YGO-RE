import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from "..";
import { Card } from "server/duel/card";
import { getDuel } from "server/duel/duel";
import { getFilteredCards } from "server/duel/utils";
import pickPosition from "server/popups/PickPosition";

/*
    If "Harpie Lady" is on the field: Special Summon 1 "Harpie Lady" 
    or "Harpie Lady Sisters" from your hand or Deck.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

    const condition = () => {
        const hasEmptyZones = duel.getEmptyFieldZones('MZone', controller.player, 'Player').size() > 0;
        const harpiedLadyIsOnField = getFilteredCards(duel, {
            name: ["Harpie Lady"],
            location: ["MZone1", "MZone2", "MZone3", "MZone4", "MZone5", "SZone1", "SZone2", "SZone3", "SZone4", "SZone5"],
            position: ["FaceUpAttack", "FaceUpDefense", "FaceUp"]
        })
        const harpieLadyInDeckOrHand = getFilteredCards(duel, {
            name: ["Harpie Lady", "Harpie Lady Sisters"],
            location: ["Hand", "Deck"],
            controller: [controller.player]
        })

        return harpiedLadyIsOnField.size() > 0 && hasEmptyZones && harpieLadyInDeckOrHand.size() > 0
    }
    
    const effect = async () => {
        const harpieLadies = getFilteredCards(duel, {
            name: ["Harpie Lady", "Harpie Lady Sisters"],
            location: ["Hand", "Deck"],
            controller: [controller.player]
        })

        if(harpieLadies.size() === 0) return

        const target = controller.pickTargets(1, harpieLadies)[0]
        const position = await pickPosition(controller.player, target.art);
        const zone = duel.pickZone(controller);

        target.specialSummon(zone, position)
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