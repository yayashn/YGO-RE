import type { Card } from "server/duel/card"
import { CardEffect } from "..";

/*
    When this card inflicts Battle Damage to your opponent's Life Points, draw 1 card from your Deck.
*/
export default (card: Card) => {
    const controller = card.getController()

    const effect = async () => {
        controller.draw(1)
    }

    const effects: CardEffect[] = [
        {
            condition: () => false,
            effect: () => effect(),
            location: ['MZone'],
            trigger: 'INFLICTS_BATTLE_DAMAGE'
        }
    ]

    return effects
}