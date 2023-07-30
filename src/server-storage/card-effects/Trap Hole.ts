import type { Card } from "server/duel/card"
import { getDuel } from "server/duel/duel"
import { CardEffect } from ".";
import NormalTrap from "server-storage/conditions/NormalTrap";

/*
    When your opponent Normal or Flip Summons 1 monster with 1000 or more ATK:
    Target that monster; destroy that target.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

    const condition = () => {
        const action = duel.getLastAction()

        if(action === undefined) return false;
        if(action.cards === undefined) return false;

        if(["Normal Summon", "Flip Summon", "Tribute Summon"].includes(action.action)) {
            return action.cards.size() === 1 && action.cards[0].atk.get()! >= 1000
        }
        return false
    }
    
    const target = () => {
        const { cards } = duel.getAction(["Normal Summon", "Flip Summon", "Tribute Summon"])!;
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
            location: ['SZone'],
            action: {
                action: "EFFECT_DESTROY_MONSTER",
                cards: [card],
                player: controller
            }
        }
    ]

    return effects
}