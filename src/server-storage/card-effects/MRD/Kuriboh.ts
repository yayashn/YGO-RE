import type { Card } from 'server/duel/card'
import { getDuel } from 'server/duel/duel'
import { CardEffect } from '..'
import { includes } from 'shared/utils'
import QuickEffectAtkDef from 'server-storage/conditions/QuickEffectAtkDef'

/*
    During damage calculation, if your opponent's monster attacks (Quick Effect): 
    You can discard this card; you take no battle damage from that battle.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

    const condition = () => {
        return (
            QuickEffectAtkDef(card) &&
            includes(card.location.get(), 'Hand') &&
            duel.attackingCard.get() !== undefined &&
            duel.attackingCard.get()!.controller.get() !== controller.player &&
            duel.damageStep.get() === "DURING"
        )
    }

    const cost = () => {
        card.toGraveyard()
    }

    const effect = async () => {
        controller.addFloodgate('NO_BATTLE_DAMAGE', () => {
            return false
        }, card)
    }

    const effects: CardEffect[] = [
        {
            condition: () => condition(),
            cost: () => cost(),
            effect: () => effect(),
            location: ['MZone']
        }
    ]

    return effects
}
