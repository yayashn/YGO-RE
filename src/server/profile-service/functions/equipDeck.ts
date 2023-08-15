import { getProfile } from "./getProfile";
import { profileChanged } from "./profileChanged";

export const equipDeck = (player: Player, deckName: string) => {
    const profile = getProfile(player);
    profile!.Data.equipped.deck = deckName;
    profileChanged(player, profile!.Data)
}