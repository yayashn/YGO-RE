import Object from "@rbxts/object-utils";
import { getCards } from "server/utils";
import { CardFolder, DuelFolder, PlayerValue } from "server/ygo";
import { Location } from "shared/types";
import getTargets from "./getTargets";

interface CardFilter {
    location?: Location[],
    controller?: PlayerValue[],
    uid?: string[]
}

export default (YGOPlayer: PlayerValue, cardFilter: CardFilter, amount: number) => {
    if(amount === 0) {
        YGOPlayer.targettableCards.Value = "{}";
        YGOPlayer.targets.Value = "[]";
        return [];
    }

    const duel = YGOPlayer.FindFirstAncestorWhichIsA("Folder") as DuelFolder;
    const cards = getCards(duel)

    const targettableCards = cards.filter((card) => Object.entries(cardFilter).every(([key, values]) => {
        return values.some(value => card[key].Value === value)
    }))
    YGOPlayer.targettableCards.Value = targettableCards.map((card) => card.uid.Value).join(",")

    return new Promise<CardFolder[]>((resolve) => {
        const targetsConnection = YGOPlayer.targets.Changed.Connect(() => {
            if(getTargets(YGOPlayer).size() === amount) {
                targetsConnection.Disconnect()
                resolve(getTargets(YGOPlayer))
            }
        })
    })
}