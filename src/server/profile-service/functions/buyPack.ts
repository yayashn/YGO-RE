import packs from "server/shop/packs";
import { getProfile } from "./getProfile";
import { profileChanged } from "./profileChanged";

export const buyPack = (player: Player, pack: string) => {
    const profile = getProfile(player)!;
    const packData = packs[pack];

    if(profile.Data.dp >= packData.price) {
        profile.Data.dp -= packData.price;
        
        const cards = packData.getFullRandomPack();
        cards.forEach(card => {
            profile.Data.cards = [...profile.Data.cards, card]
        })
        profileChanged(player, profile!.Data)
        return cards;
    } else {
        return false
    }
}