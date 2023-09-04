import type { Card } from 'server/duel/card'
import { getDuel } from 'server/duel/duel'
import { CardEffect } from '..'
import { includes } from 'shared/utils'
import QuickEffectAtkDef from 'server-storage/conditions/QuickEffectAtkDef'

/*
    During damage calculation in your opponent's turn, if this card is being attacked: 
    You can target the attacking monster; make that target's ATK 0 during damage calculation only 
    (this is a Quick Effect). This effect can only be used once while this card is face-up on the field.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

    const condition = () => {
        return (
            QuickEffectAtkDef(card) &&
            includes(card.location.get(), 'MZone') &&
            includes(card.position.get(), 'FaceUp') &&
            !card.hasFloodgate('USED_EFFECT') &&
            duel.defendingCard.get() === card &&
            duel.attackingCard.get() !== undefined &&
            duel.attackingCard.get()!.controller.get() !== controller.player
        )
    }

    const target = () => {
        duel.addCardFloodgate('USED_EFFECT', {
            floodgateFilter: {
                card: [card]
            },
            expiry: () => { 
                return (
                    !includes(card.location.get(), 'MZone') ||
                    !includes(card.position.get(), 'FaceUp')
                )
            }
        })

        card.targets.set([duel.attackingCard.get()!])
    }

    const effect = async () => {
        const turn = duel.turn.get()
        const target = card.targets.get()[0]
        duel.addCardFloodgate('SANGA_OF_THE_THUNDER', {
            floodgateFilter: {
                card: [target],
                location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5']
            },
            expiry: () => {
                return !includes(target.location.get(), 'MZone') || duel.turn.get() !== turn
            }
        })
    }

    const effects: CardEffect[] = [
        {
            condition: () => condition(),
            effect: () => effect(),
            target: () => target(),
            location: ['MZone']
        }
    ]

    return effects
}
