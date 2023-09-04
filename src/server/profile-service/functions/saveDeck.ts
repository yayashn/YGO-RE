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

        const mainDeckCards = mainDeck.reduce((acc, curr) => {
            acc[curr.name] = (acc[curr.name] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)

        const extraDeckCards = extraDeck.reduce((acc, curr) => {
            acc[curr.name] = (acc[curr.name] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)

        for (const [key, value] of pairs(mainDeckCards)) {
            if (value > 3) {
                return false;
            }
            if(cards[key] === undefined || cards[key] < value) {
                return false;
            }
        }

        for (const [key, value] of pairs(extraDeckCards)) {
            if (value > 3) {
                return false;
            }
            if(cards[key] === undefined || cards[key] < value) {
                return false;
            }
        }

        try {
            profile.Data.decks[deckName] = {
                deck: mainDeck,
                extra: extraDeck
            }
            profileChanged(player, profile!.Data)
            return true;
        } catch(e) {
            warn(e)
        }
    }
    return false;
}