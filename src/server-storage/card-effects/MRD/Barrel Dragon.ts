import type { Card } from "server/duel/card"
import NormalEffect from "server-storage/conditions/NormalEffect";
import { getDuel } from "server/duel/duel";
import { CardEffect } from "..";
import { getFilteredCards } from "server/duel/utils";
import waiting from "server/popups/waiting";
import { includes } from "shared/utils";

/*
Once per turn: You can target 1 monster your opponent controls; 
toss a coin 3 times and destroy it if at least 2 of the results are heads.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!
    const opponent = duel.getOpponent(controller.player)
    
    const condition = () => {
        return NormalEffect(card) && includes(card.location.get(), "MZone") && !card.hasFloodgate("USED_EFFECT")
    }
    
    const target = () => {
        const targettableCards = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            controller: [opponent.player],
        })
        card.targets.set(controller.pickTargets(1, targettableCards))
    }

    const effect = async () => {
        const target = card.targets.get()[0]
        const turnActivated = duel.turn.get()
        duel.addCardFloodgate("USED_EFFECT", {
            floodgateFilter: {
                card: [card],
            },
            expiry: () => {
                return duel.turn.get() !== turnActivated;
            }
        })

        const random = new Random();
        const threeCoinFlips: ("Heads" | "Tails")[] = [];
        for(let i = 0; i < 3; i++) {
            const coinFlip = random.NextInteger(0, 1) === 0 ? "Heads" : "Tails";
            threeCoinFlips.push(coinFlip)
        }
        const numberOfHeads = threeCoinFlips.filter((flip) => flip === "Heads").size();
        const finishWaiting = waiting(`Number of Heads: ${numberOfHeads}`, controller.player);
        const finishWaiting2 = waiting(`Number of Heads: ${numberOfHeads}`, opponent.player);
        await Promise.delay(1);
        finishWaiting();
        finishWaiting2();
        if(numberOfHeads >= 2) {
            target.destroy("Effect", card);
        }
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