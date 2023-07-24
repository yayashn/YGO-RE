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