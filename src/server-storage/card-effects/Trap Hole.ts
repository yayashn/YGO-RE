import type { Card } from "server/duel/card"
import { getDuel } from "server/duel/duel"
import { CardEffect } from ".";
import NormalTrap from "server-storage/conditions/NormalTrap";
import { includes } from "shared/utils";

/*
    When your opponent Normal or Flip Summons 1 monster with 1000 or more ATK:
    Target that monster; destroy that target.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!
    const opponent = duel.getOpponent(controller.player)!

    const condition = () => {
        if(opponent.action.get() === undefined) return false;

        const { action, cards } = opponent.action.get()!;

        if(action === undefined) return false;
        if(cards === undefined) return false;

        if(includes(action, "Normal Summon") || includes(action, "Flip Summon") || includes(action, "Tribute Summon")) {
            return cards.size() === 1 && cards[0].atk.get()! >= 1000
        }

        return false
    }
    
    const target = () => {
        const { cards } = opponent.action.get()!;
        card.targets.set(cards!)
    }

    const effect = () => {
        const target = card.targets.get()[0]
        target.destroy("Effect")
    }

    const effects: CardEffect[] = [
        {
            condition: () => NormalTrap(card) && condition(),
            target: () => target(),
            effect: () => effect(),
            location: ['SZone']
        }
    ]

    return effects
}