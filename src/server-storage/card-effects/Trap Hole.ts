import { getAction, getFilteredCards, getOpponent, getTargets, pickTargets, setTargets, stringifyCards } from "server/utils";
import type { CardFolder, DuelFolder } from "server/types";
import { CardEffect } from ".";
import NormalTrap from "server-storage/conditions/NormalTrap";
import { includes } from "shared/utils";

/*
    When your opponent Normal or Flip Summons 1 monster with 1000 or more ATK:
    Target that monster; destroy that target.
*/
export default (card: CardFolder) => {
    const controller = card.controller.Value
    const opponent = getOpponent(controller)

    const condition = () => {
        const { action, summonedCards } = getAction(opponent)

        if(includes(action, "Normal Summon") || includes(action, "Flip Summon") || includes(action, "Tribute Summon")) {
            return summonedCards?.size() === 1 && summonedCards[0].atk.Value >= 1000
        }

        return false
    }
    
    const target = () => {
        const { summonedCards } = getAction(opponent)
        card.targets.Value = stringifyCards(summonedCards!)
    }

    const effect = () => {
        const target = getTargets(controller, card.targets.Value)[0]
        target.destroy_.Fire("Effect")
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