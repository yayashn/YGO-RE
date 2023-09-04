import type { Card } from "server/duel/card"
import NormalEffect from "server-storage/conditions/NormalEffect";
import { getDuel } from "server/duel/duel";
import { CardEffect } from "..";
import { getFilteredCards } from "server/duel/utils";
import options from "server/popups/options";
import waiting from "server/popups/waiting";
import { includes } from "shared/utils";

/*
Once per turn: You can toss a coin and call it. If you call it right,
 destroy all monsters your opponent controls. If you call it wrong, 
 destroy as many monsters you control as possible, and if you do, take 
 damage equal to half the total ATK those destroyed monsters had while face-up 
 on the field.
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!
    const opponent = duel.getOpponent(controller.player)
    
    const condition = () => {
        return NormalEffect(card) && includes(card.location.get(), "MZone") && !card.hasFloodgate("USED_EFFECT")
    }

    const effect = async () => {
        const turnActivated = duel.turn.get()
        duel.addCardFloodgate("USED_EFFECT", {
            floodgateFilter: {
                card: [card],
            },
            expiry: () => {
                return duel.turn.get() !== turnActivated;
            }
        })

        const selectedOption = await options("Heads or Tails?", controller.player, ["Heads", "Tails"]);
        const random = new Random();
        const coinFlip = random.NextInteger(0, 1) === 0 ? "Heads" : "Tails";
        const finishWaiting = waiting(`${controller.player.Name} called ${selectedOption} and the result was ${coinFlip}!`, controller.player);
        const finishWaiting2 = waiting(`${controller.player.Name} called ${selectedOption} and the result was ${coinFlip}!`, opponent.player);
        await Promise.delay(1);
        finishWaiting();
        finishWaiting2();

        if(coinFlip === selectedOption) {
            const monsters = getFilteredCards(duel, {
                location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
                controller: [opponent.player],
            })
            monsters.forEach(monster => {
                monster.destroy("Effect", card)
            })
        } else {
            const monsters = getFilteredCards(duel, {
                location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
                controller: [controller.player],
            })
            const totalAtk = monsters.reduce((acc, curr) => acc + curr.getAtk(), 0)
            monsters.forEach(monster => {
                monster.destroy("Effect", card)
            })
            controller.changeLifePoints(-totalAtk / 2)
        }
    }

    const effects: CardEffect[] = [
        {
            condition: () => condition(),
            effect: () => effect(),
            location: ['MZone']
        }
    ]

    return effects
}