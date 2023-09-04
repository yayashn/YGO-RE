import type { Card } from "server/duel/card"
import NormalEffect from "server-storage/conditions/NormalEffect";
import { getDuel } from "server/duel/duel";
import { CardEffect } from "..";
import { getFilteredCards } from "server/duel/utils";
import waiting from "server/popups/waiting";
import { includes } from "shared/utils";

/*
    Once per turn: You can Tribute 1 monster; inflict damage to your opponent
    equal to half the Tributed monster's ATK on the field.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!
    const opponent = duel.getOpponent(controller.player)
    
    const condition = () => {
        return NormalEffect(card) && includes(card.location.get(), "MZone") && !card.hasFloodgate("USED_EFFECT")
    }
    
    const cost = () => {
        const turn = duel.turn.get();
        const tribute = controller.pickTargets(1, getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            controller: [controller.player]
        }))[0]
        const currentAtk = tribute.getAtk()

        duel.addCardFloodgate("USED_EFFECT", {
            floodgateFilter: {
                card: [card],
            },
            expiry: () => {
                return duel.turn.get() !== turn;
            },
            floodgateValue: {
                damage: currentAtk / 2
            }
        })

        tribute.toGraveyard()
    }

    const effect = async () => {
        const damage = (card.getFloodgates("USED_EFFECT")[0].floodgateValue as { damage: number }).damage
        opponent.changeLifePoints(-damage)
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