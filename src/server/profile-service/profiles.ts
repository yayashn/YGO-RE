import { Profile } from "@rbxts/profileservice/globals";
import packs from "server/shop/packs";
import { CardTemplate, PlayerData } from "server/types";
import getCardData from "shared/utils";

export const profiles: Record<string, Profile<PlayerData> | undefined> = {}

const profileChanged = (player: Player) => {
    (player.FindFirstChild("profileChanged") as BindableEvent).Fire()
}

export const getProfile = (player: Player) => {
    return profiles[player.UserId]
}

export const addCardToDeck = (player: Player, card: CardTemplate, deckName: string) => {
    const profile = getProfile(player)
    const cardData = getCardData(card.name)!;
    if (profile !== undefined) {
        const deck = profile.Data.decks[deckName];
        if(cardData["type"].match("Fusion").size() > 0) {
            if(deck.extra.size() < 15 && deck.extra.filter((c) => c.name === card.name).size() < 3) {
                deck.extra.push(card);
            }
        } else {
            if(deck.deck.size() < 60 && deck.deck.filter((c) => c.name === card.name).size() < 3) {
                deck.deck.push(card);
            }
        }
    }
    profileChanged(player);
}

export const removeCardFromDeck = (player: Player, card: CardTemplate, deckName: string) => {
    const profile = getProfile(player)
    const cardData = getCardData(card.name)!;
    if (profile !== undefined) {
        const deck = profile.Data.decks[deckName];
        if(cardData["type"].match("Fusion").size() > 0) {
            deck.extra = deck.extra.filter((c) => c !== card);
        } else {
            deck.deck = deck.deck.filter((c) => c !== card);
        }
    }
    profileChanged(player);
}

export const changeDp = (player: Player, amount: number) => {
    const profile = getProfile(player)
    if (profile !== undefined) {
        profile.Data.dp += amount;
    }
    profileChanged(player);
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
        profileChanged(player);
        return cards;
    } else {
        return false
    }
}