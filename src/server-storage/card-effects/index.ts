import type { CardFolder } from "server/types";
import Sparks from "./Sparks";
import { Location } from "shared/types";

export type CardEffect = {
    condition: (card: CardFolder) => boolean,
    effect: (card: CardFolder) => void,
    location: (Location | "SZone" | "MZone" | "Hand")[]
}

export default {
    "Sparks": Sparks
} as {
    [key: string]: (card: CardFolder) => CardEffect[]
}