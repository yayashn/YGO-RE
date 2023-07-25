import { Card } from "server/duel/card"
import { Location } from "server/duel/types"

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