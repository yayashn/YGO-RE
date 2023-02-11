import Object from "@rbxts/object-utils";
import { Card, ProfileTemplate } from "../profileTemplate";
import { Profile } from "@rbxts/profileservice/globals";

export const getCards = (profile: Profile<ProfileTemplate>) => {
    return profile.Data.cards;
}

export const getDeck = (profile: Profile<ProfileTemplate>) => {
    return profile.Data.decks[profile.Data.equipped.deck];
}

export const addCardToDeck = (profile: Profile<ProfileTemplate>, card: Card) => {
    const deck = getDeck(profile);
    const cards = getCards(profile);

    const numberOfCardInDeck = deck.filter(c => {
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
    
    profile.Data.decks[profile.Data.equipped.deck].push(card)
}

export const removeCardFromDeck = (profile: Profile<ProfileTemplate>, card: Card) => {
    const deck = getDeck(profile);

    const numberOfCardInDeck = deck.filter(c => {
        return Object.entries(card).every(([key, value]) => {
            return c[key] === value
        })
    }).size()
    if(numberOfCardInDeck === 0) return

    const index = deck.findIndex(c => {
        return Object.entries(card).every(([key, value]) => {
            return c[key] === value
        })
    })

    profile.Data.decks[profile.Data.equipped.deck].remove(index)
}