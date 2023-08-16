import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from "..";
import { Card } from "server/duel/card";
import { getDuel } from "server/duel/duel";
import { getFilteredCards } from "server/duel/utils";
import pickPosition from "server/popups/PickPosition";
import { CardFloodgate, FloodgateValueTakeControl } from "server/duel/types";
import { includes } from "shared/utils";

/*
    Target 1 monster in either GY; Special Summon it.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

    const condition = () => {
        const hasEmptyZones = duel.getEmptyFieldZones('MZone', controller.player, 'Player').size() > 0;
        const targettableCards = getFilteredCards(duel, {
            location: ['GZone'],
            type: ['Monster'],
        })
        return targettableCards.size() >= 1 && hasEmptyZones;
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
        const zone = duel.pickZone(controller);
        const position = await pickPosition(controller.player, targets[0].art);

        let expiryEnabled = false;
        if(controller.player !== targets[0].controller.get()) {
            const priority = card.getFloodgates("TAKE_CONTROL").size() + 1;
            const takeControlFloodgate: CardFloodgate<FloodgateValueTakeControl> = {
                floodgateFilter: {
                    card: [targets[0]],
                },
                floodgateValue: {
                    target: targets[0],
                    priority: priority,
                    controller: controller.player,
                },
                expiry: () => {
                    return expiryEnabled && !includes(targets[0].location.get(), "MZone")
                }
            };
            duel.addCardFloodgate("TAKE_CONTROL", takeControlFloodgate);
        }
        targets[0].specialSummon(zone, position)
        expiryEnabled = true;
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