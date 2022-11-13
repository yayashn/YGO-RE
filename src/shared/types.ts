export type Remote = "showField" | "createCard3D" | "moveCard3D" | "handLayout"
export type Bindable = "startDuel"

type MZone = "MZone1" | "MZone2" | "MZone3" | "MZone4" | "MZone5";
type SZone = "SZone1" | "SZone2" | "SZone3" | "SZone4" | "SZone5";
export type FieldZone = MZone | SZone;
export type Zones = FieldZone | "FZone" | "GZone" | "EZone" | "BZone";
export type YGOLocation = Zones | "Hand" | "Deck"

export interface Zone {
    name: Zones;
    occupied?: boolean;
    locked?: boolean;
    opponentZone?: boolean;
    getPart: () => {}
}

export interface CardGui extends SurfaceGui {
    Key: "card"
}