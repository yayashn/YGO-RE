
import { Location } from "shared/types";
import { Card } from "server/ygo/Card";

export type CardEffect = {
    condition?: () => boolean,
    effect?: Callback,
    location?: (Location | "SZone" | "MZone" | "Hand")[],
    cost?: Callback
    target?: Callback
    fusionMaterials?: Record<string, number>
}

export default {

} as {
    [key: string]: (card: Card) => CardEffect[]
}