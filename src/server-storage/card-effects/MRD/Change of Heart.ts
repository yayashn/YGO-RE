import type { Card } from "server/duel/card"
import NormalSpell from "server-storage/conditions/NormalSpell";
import { getDuel } from "server/duel/duel";
import { CardEffect } from "..";
import { getFilteredCards } from "server/duel/utils";
import { includes } from "shared/utils";

/*
Target 1 monster your opponent controls; take control of it until the End Phase.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!
    const opponent = duel.getOpponent(controller.player)
    
    const condition = () => {
        const hasEmptyZones = duel.getEmptyFieldZones('MZone', controller.player, 'Player').size() > 0;

        return getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            controller: [opponent.player],
        }).size() > 0 && hasEmptyZones;
    }

    const target = () => {
        const targettableCards = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            controller: [opponent.player],
        })
        card.targets.set(controller.pickTargets(1, targettableCards))
    }

    const effect = () => {
        const target = card.targets.get()[0]
        const takeControlFloodgates = card.getFloodgates(`TAKE_CONTROL`);
        const newTakeControlFloodgateIndex = takeControlFloodgates.size();

        const zone = controller.pickZone(
            duel.getEmptyFieldZones('MZone', controller.player, 'Player')
        )
        
        duel.addCardFloodgate(`TAKE_CONTROL`, {
            floodgateFilter: {
                card: [target],
            },
            floodgateValue: {
                target: target,
                priority: newTakeControlFloodgateIndex + 1,
                controller: controller.player,
            },
            expiry: () => {
               return duel.phase.get() === "EP" || !includes(target.location.get(), "MZone")
            }
        })
        target.location.set(zone)
    }

    const effects: CardEffect[] = [
        {
            condition: () => NormalSpell(card) && condition(),
            effect: () => effect(),
            target: () => target(),
            location: ['SZone']
        }
    ]

    return effects
}