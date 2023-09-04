import type { Card } from "server/duel/card"
import { getDuel } from "server/duel/duel"
import { CardEffect } from "..";
import { includes } from "shared/utils";
import Object from "@rbxts/object-utils";
import CounterTrap from "server-storage/conditions/CounterTrap";

/*
    When a Trap Card is activated: Pay 1000 LP; negate the activation, and if you do, destroy it.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

    const condition = () => {
        const action = duel.getLastAction()
        
        if(action === undefined) return false;
        if(action.cards === undefined) return false;
        if(controller.lifePoints.get() < 1000) return false;

        if(includes(action.action, "Activate Trap")) {
            return action.cards.size() === 1;
        }
        return false
    }
    
    const cost = () => {
        if(duel.speedSpell.get() < 3) {
            duel.speedSpell.set(3)
        }

        controller.changeLifePoints(-1000)
    }

    const effect = () => {
        const targets = duel.getSecondLastAction()!.cards

        if(includes(targets[0].type.get(), "Trap")) {
            const chain = duel.chain.get()
            chain[Object.keys(chain).size() - 1].negated = true
        }
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