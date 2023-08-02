import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from "..";
import { Card } from "server/duel/card";
import { getDuel } from "server/duel/duel";
import { getFilteredCards } from "server/duel/utils";

/*
    Target 2 Monster Cards from your opponent's Graveyard. Banish them.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

    const condition = () => {
        const targettableCards = getFilteredCards(duel, {
            location: ['GZone'],
            type: ['Monster'],
            controller: [duel.getOpponent(controller.player).player]
        })
        return targettableCards.size() >= 2
    }
    
    const target = () => {
        const targettableCards = getFilteredCards(duel, {
            location: ['GZone'],
            type: ['Monster'],
            controller: [duel.getOpponent(controller.player).player]
        })
        card.targets.set(controller.pickTargets(2, targettableCards))
    }

    const effect = () => {
        const targets = card.targets.get()
        targets.forEach(target => target.banish("FaceUp"))
    }

    const effects: CardEffect[] = [
        {
            condition: () => NormalSpell(card) && condition(),
            target: () => target(),
            effect: () => effect(),
            location: ['SZone']
        }
    ]

    return effects
}