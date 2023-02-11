import { Profile } from "@rbxts/profileservice/globals";
import { Card, ProfileTemplate } from "../profileTemplate";
import { instance } from "shared/utils";
import { getDeck, getCards, addCardToDeck, removeCardFromDeck } from "./cards";

export default (profile: Profile<ProfileTemplate>, player: Player) => {
    const getDeckBf = instance("BindableFunction", "getDeck", player) as BindableFunction;
    getDeckBf.OnInvoke = () => {
        return getDeck(profile);
    }

    const getCardsBf = instance("BindableFunction", "getCards", player) as BindableFunction;
    getCardsBf.OnInvoke = () => {
        return getCards(profile);
    }

    const addCardToDeckBe = instance("BindableEvent", "addCardToDeck", player) as BindableEvent;
    addCardToDeckBe.Event.Connect((card: Card) => {
        addCardToDeck(profile, card);
    })

    const removeCardFromDeckBe = instance("BindableEvent", "removeCardFromDeck", player) as BindableEvent;
    removeCardFromDeckBe.Event.Connect((card: Card) => {
        removeCardFromDeck(profile, card);
    })
}