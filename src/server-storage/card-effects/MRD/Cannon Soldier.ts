import type { Card } from "server/duel/card"
import NormalEffect from "server-storage/conditions/NormalEffect";
import { getDuel } from "server/duel/duel";
import { CardEffect } from "..";
import { getFilteredCards } from "server/duel/utils";
import { includes } from "shared/utils";

/*
    You can Tribute 1 monster; inflict 500 damage to your opponent.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!
    const opponent = duel.getOpponent(controller.player)
    
    const condition = () => {
        return NormalEffect(card) && includes(card.location.get(), "MZone")
    }
    
    const cost = () => {
        const tribute = controller.pickTargets(1, getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            controller: [controller.player]
        }))[0]

        tribute.toGraveyard()
    }

    const effect = async () => {
        controller.changeLifePoints(-500)
    }

    const effects: CardEffect[] = [
        {
            condition: () => condition(),
            effect: () => effect(),
            cost: () => cost(),
            location: ['MZone']
        }
    ]

    return effects
}