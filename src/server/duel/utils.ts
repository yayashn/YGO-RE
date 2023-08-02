import { Dictionary as Object } from "@rbxts/sift"
import { Duel } from "./duel"
import { CardFilter } from "./types"
import { Card } from "./card"

export const getFilteredCards = (duel: Duel, cardFilter: CardFilter) => {
    const cards = getCards(duel);
    return cards.filter((card) =>
        Object.entries(cardFilter).every(([key, values]) => {
            if(key === "type") {
                return values!.some((value) => card["type"].get().match(value as string).size() > 0)
            }
            if(key === "uid") {
                return values!.some((value) => card[key] === value)
            }
            if(key === "card") {
                return (values as Card[]).includes(card)
            }
            return values!.some((value) => card[key].get() === value)
        })
    )
}

const cardCache = new Map<string, Card[]>();

export const getCards = (duel: Duel): Card[] => {
    // Generate a unique key based on the UserId of player1 and the players' card counts
    const key = `${duel.player1.player.UserId},${duel.player1.cards.get().size()},${duel.player2.cards.get().size()}`;
    
    // If we've already computed the result for this duel, return it
    if (cardCache.has(key)) {
        return cardCache.get(key)!;
    }
    
    // Otherwise, compute the result and store it in the cache
    const cards1 = duel.player1.cards.get();
    const cards2 = duel.player2.cards.get();
    const result = [...cards1, ...cards2];
    cardCache.set(key, result);

    return result;
}
