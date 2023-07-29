import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from ".";
import { Card } from "server/duel/card";
import { getDuel } from "server/duel/duel";
import { getFilteredCards } from "server/duel/utils";
import pickPosition from "server/popups/PickPosition";

/*
    Target 1 monster in either GY; Special Summon it.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

    const condition = () => {
        const targettableCards = getFilteredCards(duel, {
            location: ['GZone'],
            type: ['Monster'],
        })
        return targettableCards.size() >= 1
    }
    
    const target = () => {
        const targettableCards = getFilteredCards(duel, {
            location: ['GZone'],
            type: ['Monster'],
        })
        card.targets.set(controller.pickTargets(1, targettableCards))
    }

    const effect = async () => {
        const targets = card.targets.get()
        targets[0].controller.set(controller.player)
        const zone = duel.pickZone(controller);
        const position = await pickPosition(controller.player, targets[0].art);
        targets[0].specialSummon(zone, position)
    }

    const effects: CardEffect[] = [
        {
            condition: () => NormalSpell(card) && condition(),
            target: () => target(),
            effect: () => effect(),
            location: ['SZone']
        }
    ]

    return effects
}