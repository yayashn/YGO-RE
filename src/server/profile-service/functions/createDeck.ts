import { getProfile } from "./getProfile";
import { profileChanged } from "./profileChanged";

export const createDeck = (player: Player, deckName: string) => {
    const profile = getProfile(player);
    profile!.Data.decks[deckName] = {
        deck: [],
        extra: []
    }
    profileChanged(player, profile!.Data)
}