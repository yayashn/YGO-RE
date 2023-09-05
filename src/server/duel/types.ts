import { Signal } from "@rbxts/beacon";
import type { Card } from "./card";
import type { YPlayer } from "./player";
import type { CardEffect } from "server-storage/card-effects";

export type Phase = "DP" | "SP" | "MP1" | "BP" | "MP2" | "EP";
export type CardData = {
    name: string;
    art: string;
    id: number;
    type: string;
    desc: string;
    atk?: number;
    def?: number;
    level?: number;
    race: string;
    attribute: string;
}
export type Position = "FaceUpAttack" | "FaceUpDefense" | "FaceUp" | "FaceDown" | "FaceDownDefense";
export type MZone = "MZone1" | "MZone2" | "MZone3" | "MZone4" | "MZone5";
export type SZone = "SZone1" | "SZone2" | "SZone3" | "SZone4" | "SZone5";
export type Location = MZone | SZone | "GZone" | "Deck" | "Hand" | "BZone" | "EZone" | "FZone";

export type ChainedEffect = {
    effect: Callback,
    negated: boolean,
    card: Card
    prediction: Record<string, unknown>
}

export type PendingEffect = {
    card: Card,
    effect: CardEffect,
    prediction: Record<string, unknown>,
}

export type SelectableZone = {
    zone: Location;
    opponent: boolean;
    player: boolean;
};
export type GetEmptyFieldZonesReturnType<T extends boolean> = T extends true
  ? Vector3Value[]
  : SelectableZone[];

export type Action = {
    action: string,
    cards: Card[],
    player: YPlayer,
    prediction: Record<string, unknown>
}

export type CardFilter = {
    name?: string[]
    uid?: string[]
    exclude?: string[]
    location?: Location[]
    controller?: Player[]
    type?: string[]
    race?: string[]
    position?: string[]
    card?: Card[]
    atk?: (`<=${number}` | number | `>=${number}`)[]
    attribute?: string[]
    def?: (`<=${number}` | number | `>=${number}`)[]
    order?: number[]
}

export type CardFloodgate<T = unknown> = {
    floodgateFilter: CardFilter,
    expiry: () => boolean,
    floodgateValue?: T
}

export type ANY = Record<string, unknown>

export type FloodgateValueAtkDefModifier = {
    value: number,
    modifierId: string
}

export type FloodgateValueCannotBeDestroyedBy = {
    target: Card,
}

export type FloodgateValueTakeControl = {
    target: Card,
    priority: number,
    controller: Player,
}

export type CardPublic = {
    uid: string,
    controller: Player,
    location: Location,
    position: Position
    order: number,
    atk?: number | undefined,
    def?: number | undefined,
    level?: number | undefined,
    desc?: string | undefined,
    name?: string | undefined,
    art?: string | undefined,
    type?: string | undefined,
    chainLink?: number,
    attribute?: string | undefined,
    race?: string | undefined,
}

export type CardAction =
    | 'Activate'
    | 'Attack'
    | 'Normal Summon'
    | 'Tribute Summon'
    | 'Special Summon'
    | 'Set'
    | 'Flip Summon'
    | 'Change Position'

