import Object from "@rbxts/object-utils";
import { Workspace } from "@rbxts/services";
import type { CardPublic, Location, MZone, SZone } from "server/duel/types";
import cards from "shared/sets/cards";

export default function getCardData(cardName: string) {
    return cards.find(card => card.name === cardName);
}

export function createInstance<T extends keyof CreatableInstances>(className: T, name: string, parent: Instance) {
	const i = new Instance(className);
	i.Name = name;
	i.Parent = parent;
	return i;
}

export const get3DZone = (location: Location, isOpponent?: boolean) => {
    const field = game.Workspace.Field3D.Field;
    if(isOpponent) {
        return field.Opponent.FindFirstChild(location, true);
    } else {
        return field.Player.FindFirstChild(location, true);
    }
}

export const includes = (str: string, substr: string) => {
    return str.match(substr).size() > 0
}

export const getFieldZonePart = (player: "Opponent" | "Player", part: MZone | SZone) => Workspace.Field3D.Field[player].Field[part]

export function areCardsEqual(card1: CardPublic, card2: CardPublic): boolean {
    try {
        const keys1 = Object.keys(card1);
        const keys2 = Object.keys(card2);
    
        if (keys1.size() !== keys2.size()) return false;
    
        for (const key of keys1) {
            if (card1[key] !== card2[key]) {
                return false;
            }
        }
    } catch(e) {
        
    }
    
    return true;
}