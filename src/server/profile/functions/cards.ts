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

    const numberOfCardInDeck = deck[extra ? "extra" : "deck"].filter(c => {
        return Object.entries(card).every(([key, value]) => {
            return c[key] === value
        })
    }).size()
    if(numberOfCardInDeck >= 3) return


    const numberOfCardInInventory = cards.filter(c => {
        return Object.entries(card).every(([key, value]) => {
            return c[key] === value
        })
    }).size()
    if((numberOfCardInInventory - numberOfCardInDeck) <= 0) return

    
    profile.Data.decks[deckName][extra ? "extra" : "deck"].push(card)
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