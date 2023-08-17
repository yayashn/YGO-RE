import type { Card } from "server/duel/card"
import { getDuel } from "server/duel/duel"
import { CardEffect } from "..";
import { includes } from "shared/utils";
import Object from "@rbxts/object-utils";
import CounterTrap from "server-storage/conditions/CounterTrap";

/*
    When a monster(s) would be Summoned, OR a Spell/Trap Card is activated: 
    Pay half your LP; negate the Summon or activation, and if you do, destroy that card.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

    const condition = () => {
        const action = duel.getLastAction()

        if(action === undefined) return false;
        if(action.cards === undefined) return false;

        if(card.location.get() === "SZone3") {
            print(action.action)
        }

        if(includes(action.action, "Summon") || includes(action.action, "Activate Spell") || includes(action.action, "Activate Trap")) {
            return (action.cards.size() >= 1 && includes(action.action, "Summon")) || action.cards.size() === 1;
        }
        return false
    }
    
    const cost = () => {
        if(duel.speedSpell.get() < 3) {
            duel.speedSpell.set(3)
        }
        controller.changeLifePoints(-math.floor(controller.lifePoints.get() / 2))
    }

    const effect = () => {
        const targets = duel.getSecondLastAction()!.cards

        if(includes(targets[0].type.get(), "Spell") || includes(targets[0].type.get(), "Trap")) {
            const chain = duel.chain.get()
            chain[Object.keys(chain).size() - 1].negated = true
        }
        targets.forEach(target => target.destroy("Effect"))
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