import { CardTemplate } from "server/types"
import { getProfile } from "./getProfile"
import { profileChanged } from "./profileChanged"

export const saveDeck = (player: Player, deckName: string, mainDeck: CardTemplate[], extraDeck: CardTemplate[]) => {
    const profile = getProfile(player)
    if (profile !== undefined) {
        const cards = profile.Data.cards.reduce((acc, curr) => {
            acc[curr.name] = (acc[curr.name] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
        print(1)

        const mainDeckCards = mainDeck.reduce((acc, curr) => {
            acc[curr.name] = (acc[curr.name] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
        print(2)

        const extraDeckCards = extraDeck.reduce((acc, curr) => {
            acc[curr.name] = (acc[curr.name] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)

        print(3)

        for (const [key, value] of pairs(mainDeckCards)) {
            if (value > 3) {
                return false;
            }
            if(cards[key] === undefined || cards[key] < value) {
                return false;
            }
        }
        
        print(4)

        for (const [key, value] of pairs(extraDeckCards)) {
            if (value > 3) {
                return false;
            }
            if(cards[key] === undefined || cards[key] < value) {
                return false;
            }
        }
        
        print(5)

        try {
            print(6, deckName)
            profile.Data.decks[deckName] = {
                deck: mainDeck,
                extra: extraDeck
            }
            print(7)
            profileChanged(player, profile!.Data)
            print(8)
            return true;
        } catch(e) {
            warn(e)
        }
    }
    return false;
}