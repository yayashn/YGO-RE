import { CardTemplate } from "server/types";
import LOB from "./LOB";

export type Pack = {
    price: number;
    cards: CardTemplate[],
    getFullRandomPack: () => CardTemplate[],
    alert: Callback
}

const packs: Record<string, Pack> = {
    LOB
}

export default packs