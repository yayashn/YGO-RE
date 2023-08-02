import { Profile } from "@rbxts/profileservice/globals";
import packs from "server/shop/packs";
import { CardTemplate, PlayerData } from "server/types";
import getCardData from "shared/utils";
import items from "./items";

export const profiles: Record<string, Profile<PlayerData> | undefined> = {}

const profileChanged = (player: Player, playerData: PlayerData) => (player.FindFirstChild("profileChanged", true) as BindableEvent).Fire(playerData);

export const getProfile = (player: Player) => {
    return profiles[player.UserId]
}

export const saveDeck = (player: Player, deckName: string, mainDeck: CardTemplate[], extraDeck: CardTemplate[]) => {
    const profile = getProfile(player)
    if (profile !== undefined) {
        profile.Data.decks[deckName] = {
            deck: mainDeck,
            extra: extraDeck
        }
    }
    profileChanged(player, profile!.Data)
}

export const changeDp = (player: Player, amount: number) => {
    const profile = getProfile(player)
    if (profile !== undefined) {
        profile.Data.dp += amount;
    }
    profileChanged(player, profile!.Data)
}

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

export const getEquippedDeck = (player: Player) => {
    const profile = getProfile(player);
    return profile!.Data.decks[profile!.Data.equipped.deck];
}

export const equipDeck = (player: Player, deckName: string) => {
    const profile = getProfile(player);
    profile!.Data.equipped.deck = deckName;
    profileChanged(player, profile!.Data)
}

export const getEquippedSleeve = (player: Player) => {
    const profile = getProfile(player);
    return items.sleeves[profile!.Data.equipped.sleeve as keyof typeof items.sleeves];
}