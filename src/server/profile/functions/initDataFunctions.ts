import { Profile } from "@rbxts/profileservice/globals";
import { Card, ProfileTemplate } from "../profileTemplate";
import { createInstance, getCardData, instance } from "shared/utils";
import { getDeck, getCards, addCardToDeck, removeCardFromDeck, getDecks } from "./cards";
import { addDeck, getAvatar, getDP } from "./handleData";
import avatars from "../avatars";
import { ServerScriptService } from "@rbxts/services";
import packs from "server/shop/packs/packs";

const playersFolder = ServerScriptService.FindFirstChild("instances")!.FindFirstChild("players") as Folder;

export default (profile: Profile<ProfileTemplate>, player: Player) => {
    const playerFolder = playersFolder.WaitForChild(player.Name) as Folder;

    const dp = createInstance("NumberValue", "dp", playerFolder);
    dp.Value = profile.Data.dp;
    dp.Changed.Connect(value => {
        profile.Data.dp = value;
    })

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

    const buyCardsBf = createInstance("BindableFunction", "buyCards", player);
    buyCardsBf.OnInvoke =(pack: string) => {
        const packData = packs[pack];

        if(dp.Value >= packData.price) {
            dp.Value -= packData.price;
            
            const cards = packData.getFullRandomPack();
            cards.forEach(card => {
                profile.Data.cards = [...profile.Data.cards, { name: card }]
            })
            return cards.map(card => {
                return getCardData(card)!;
            })
        } else {
            return false
        }
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
        return profile.Data.avatars;
    }

    const avatar = createInstance("StringValue", "avatar", playerFolder);
    const getAvatarBf = createInstance("BindableFunction", "getAvatar", player);
    getAvatarBf.OnInvoke = () => {
        const currentAvatar = avatars[profile.Data.equipped.avatar];
        avatar.Value = currentAvatar;
        return currentAvatar;
    }

    const addDeckBe = createInstance("BindableEvent", "addDeck", player);
    addDeckBe.Event.Connect((deckName: string) => {
        addDeck(profile, deckName);
    })
}