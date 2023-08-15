import { getProfile } from "./getProfile";

export const getEquippedDeck = (player: Player) => {
    const profile = getProfile(player);
    return profile!.Data.decks[profile!.Data.equipped.deck];
}
