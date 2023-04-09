import Object from "@rbxts/object-utils";
import { Card, ProfileTemplate } from "../profileTemplate";
import { Profile } from "@rbxts/profileservice/globals";

export const getCards = (profile: Profile<ProfileTemplate>) => {
    return profile.Data.cards;
}

export const getDeck = (profile: Profile<ProfileTemplate>, deckName?: string) => {
    return profile.Data.decks[deckName ?? profile.Data.equipped.deck];
}

export const getDecks = (profile: Profile<ProfileTemplate>) => {
    return profile.Data.decks;
}

export const addCardToDeck = (profile: Profile<ProfileTemplate>, card: Card, deckName: string, extra?: boolean) => {
    const deck = getDeck(profile, deckName);
    const cards = getCards(profile);

    print(1)

    const numberOfCardInDeck = deck[extra ? "extra" : "deck"].filter(c => {
        return Object.entries(card).every(([key, value]) => {
            return c[key] === value
        })
    }).size()
    if(numberOfCardInDeck >= 3) return

    print(2)

    const numberOfCardInInventory = cards.filter(c => {
        return Object.entries(card).every(([key, value]) => {
            return c[key] === value
        })
    }).size()
    if((numberOfCardInInventory - numberOfCardInDeck) <= 0) return

    print(3)
    
    profile.Data.decks[deckName][extra ? "extra" : "deck"].push(card)

    print(4)
}

export const removeCardFromDeck = (profile: Profile<ProfileTemplate>, card: Card, deckName: string, extra?: boolean) => {
    const deck = getDeck(profile, deckName);

    const numberOfCardInDeck = deck[extra ? "extra" : "deck"].filter(c => {
        return Object.entries(card).every(([key, value]) => {
            return c[key] === value
        })
    }).size()

    if(numberOfCardInDeck === 0) return

    const index = deck[extra ? "extra" : "deck"].findIndex(c => {
        return Object.entries(card).every(([key, value]) => {
            return c[key] === value
        })
    })

    profile.Data.decks[deckName][extra ? "extra" : "deck"].remove(index)
}