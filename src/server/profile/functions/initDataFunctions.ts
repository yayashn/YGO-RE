import { Profile } from "@rbxts/profileservice/globals";
import { Card, ProfileTemplate } from "../profileTemplate";
import { createInstance, instance } from "shared/utils";
import { getDeck, getCards, addCardToDeck, removeCardFromDeck, getDecks } from "./cards";
import { addDeck, getAvatar, getDP } from "./handleData";

export default (profile: Profile<ProfileTemplate>, player: Player) => {
    const getDecksBf = createInstance("BindableFunction", "getDecks", player);
    getDecksBf.OnInvoke = () => {
        return getDecks(profile)
    }

    const getDeckBf = instance("BindableFunction", "getDeck", player) as BindableFunction;
    getDeckBf.OnInvoke = (deckName: string = profile.Data.equipped.deck) => {
        return getDeck(profile, deckName);
    }

    const getEquippedDeckBf = instance("BindableFunction", "getEquippedDeck", player) as BindableFunction;
    getEquippedDeckBf.OnInvoke = () => {
        return profile.Data.equipped.deck;
    }

    const setEquippedDeckBe = instance("BindableEvent", "setEquippedDeck", player) as BindableEvent;
    setEquippedDeckBe.Event.Connect((deckName: string) => {
        profile.Data.equipped.deck = deckName;
    })

    const getCardsBf = instance("BindableFunction", "getCards", player) as BindableFunction;
    getCardsBf.OnInvoke = () => {
        return [...getCards(profile)];
    }

    const addCardToDeckBe = instance("BindableEvent", "addCardToDeck", player) as BindableEvent;
    addCardToDeckBe.Event.Connect((card: Card, deckName: string, extra?: boolean) => {
        addCardToDeck(profile, card, deckName, extra);
    })

    const removeCardFromDeckBe = instance("BindableEvent", "removeCardFromDeck", player) as BindableEvent;
    removeCardFromDeckBe.Event.Connect((card: Card, deckName: string, extra?: boolean) => {
        removeCardFromDeck(profile, card, deckName, extra);
    })

    const getAvatarsBf = createInstance("BindableFunction", "getAvatars", player);
    getAvatarsBf.OnInvoke = () => {
        
    }

    const getAvatarBf = createInstance("BindableFunction", "getAvatar", player);
    getAvatarBf.OnInvoke = () => {
        return getAvatar(profile)
    }

    const dp = createInstance("NumberValue", "dp", player);
    const getDPBf = createInstance("BindableFunction", "getDP", player);
    getDPBf.OnInvoke = () => {
        const currentDP = getDP(profile);
        dp.Value = currentDP;
        return currentDP;
    }
    const setDPBe = createInstance("BindableEvent", "setDP", player);
    setDPBe.Event.Connect((newDP: number) => {
        profile.Data.dp = newDP;
        dp.Value = newDP;
    })
    const currentDP = getDP(profile);
    dp.Value = currentDP;

    const addDeckBe = createInstance("BindableEvent", "addDeck", player);
    addDeckBe.Event.Connect((deckName: string) => {
        addDeck(profile, deckName);
    })
}