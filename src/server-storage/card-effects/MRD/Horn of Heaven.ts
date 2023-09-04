import type { Card } from "server/duel/card"
import { getDuel } from "server/duel/duel"
import { CardEffect } from "..";
import { includes } from "shared/utils";
import Object from "@rbxts/object-utils";
import CounterTrap from "server-storage/conditions/CounterTrap";
import { getFilteredCards } from "server/duel/utils";

/*
    When a monster(s) would be Summoned: Tribute 1 monster; negate the Summon, and if you do, destroy that monster(s).
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

    const condition = () => {
        const action = duel.getLastAction()

        if(action === undefined) return false;
        if(action.cards === undefined) return false;

        const monstersInField = getFilteredCards(duel, {
            location: ["MZone1", "MZone2", "MZone3", "MZone4", "MZone5"],
            controller: [controller.player],
        })

        if(includes(action.action, "Summon")) {
            return action.cards.size() >= 1 &&  monstersInField.size() >= 1
        }
        return false
    }
    
    const cost = () => {
        if(duel.speedSpell.get() < 3) {
            duel.speedSpell.set(3)
        }
        
        const monstersInField = getFilteredCards(duel, {
            location: ["MZone1", "MZone2", "MZone3", "MZone4", "MZone5"],
            controller: [controller.player],
        })

        const tributes = controller.pickTargets(1, monstersInField)
        tributes.forEach(tribute => tribute.toGraveyard())
    }

    const effect = () => {
        const targets = duel.getSecondLastAction()!.cards

        targets.forEach(target => target.destroy("Effect", card))
    }

    const effects: CardEffect[] = [
        {
            condition: () => {
                return CounterTrap(card) && condition()
            },
            cost: () => cost(),
            effect: () => effect(),
            location: ['SZone'],
        }
    ]

    return effects
}