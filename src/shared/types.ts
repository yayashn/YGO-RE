export type Remote = "showField" | "createCard3D" | "moveCard3D";
export type Bindable = "startDuel" | "handLayout";

type MZone = "MZone1" | "MZone2" | "MZone3" | "MZone4" | "MZone5";
type SZone = "SZone1" | "SZone2" | "SZone3" | "SZone4" | "SZone5";
export type FieldZone = MZone | SZone;
export type YGOZone = FieldZone | "FZone" | "GZone" | "EZone" | "BZone";
export type YGOLocation = YGOZone | "Hand" | "Deck";

export interface Zone {
	name: YGOZone;
	occupied?: boolean;
	locked?: boolean;
	opponentZone?: boolean;
	getPart: () => {};
}

export interface CardGui extends SurfaceGui {
	Key: "card";
}