import { Dictionary as Object } from "@rbxts/sift"
import { Duel } from "./duel"
import { CardFilter } from "./types"
import { Card } from "./card"

export const getFilteredCards = (duel: Duel, cardFilter: CardFilter) => {
    const cards = getCards(duel)
    return cards.filter((card) =>
        Object.entries(cardFilter).every(([key, values]) => {
            if(key === "type") {
                return values!.some((value) => card["type"].get().match(value as string).size() > 0)
            }
            if(key === "name" || key === "uid") {
                return values!.some((value) => card[key] === value)
            }
            if(key === "card") {
                return (values as Card[]).includes(card)
            }
            return values!.some((value) => card[key].get() === value)
        })
    )
}

export const getCards = (duel: Duel) => {
    const cards1 = duel.player1.cards.get()
    const cards2 = duel.player2.cards.get()
    return [...cards1, ...cards2]
}