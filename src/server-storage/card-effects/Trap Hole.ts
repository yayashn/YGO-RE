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
        if(!duel.action.get()) return false
        if(duel.action.get()?.player !== opponent) return false;

        const action = duel.action.get();

        if(action === undefined) return false;
        if(action.cards === undefined) return false;

        if(includes(action.action, "Normal Summon") || includes(action.action, "Flip Summon") || includes(action.action, "Tribute Summon")) {
            return action.cards.size() === 1 && action.cards[0].atk.get()! >= 1000
        }
        return false
    }
    
    const target = () => {
        const { cards } = duel.action.get()!;
        card.targets.set(cards!)
    }

    const effect = () => {
        const target = card.targets.get()[0]
        target.destroy("Effect")
        card.targets.set([])
    }

    const effects: CardEffect[] = [
        {
            condition: () => {
                return NormalTrap(card) && condition()
            },
            target: () => target(),
            effect: () => effect(),
            location: ['SZone']
        }
    ]

    return effects
}