export type MZone = "MZone1" | "MZone2" | "MZone3" | "MZone4" | "MZone5";
export type SZone = "SZone1" | "SZone2" | "SZone3" | "SZone4" | "SZone5";
export type FieldZone = MZone | SZone | "GZone" | "FZone" | "EZone" | "BZone";
export type Location = FieldZone | "Deck" | "Hand";

export type PlayerFolder = {
    deck: StringValue;
}

export type PublicCard = {
    location: Location;
}