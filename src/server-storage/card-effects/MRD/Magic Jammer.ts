import type { Card } from "server/duel/card"
import { getDuel } from "server/duel/duel"
import { CardEffect } from "..";
import { includes } from "shared/utils";
import Object from "@rbxts/object-utils";
import CounterTrap from "server-storage/conditions/CounterTrap";
import { getFilteredCards } from "server/duel/utils";

/*
    When a Spell Card is activated: Discard 1 card; negate the activation, and if you do, destroy it.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

    const condition = () => {
        const action = duel.getLastAction()
        
        if(action === undefined) return false;
        if(action.cards === undefined) return false;

        const cardsInHand = getFilteredCards(duel, {
            location: ['Hand'],
            controller: [controller.player],
        })

        if(includes(action.action, "Activate Spell") && cardsInHand.size() >= 1) {
            return action.cards.size() === 1;
        }
        return false
    }
    
    const cost = () => {
        if(duel.speedSpell.get() < 3) {
            duel.speedSpell.set(3)
        }
   
        const cardsInHand = getFilteredCards(duel, {
            location: ['Hand'],
            controller: [controller.player],
        })

        const discards = controller.pickTargets(1, cardsInHand)
        discards.forEach(discard => discard.toGraveyard())
    }

    const effect = () => {
        const targets = duel.getSecondLastAction()!.cards

        if(includes(targets[0].type.get(), "Spell")) {
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