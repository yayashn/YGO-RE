import type { CardFolder, PlayerValue } from "server/types";
import getTargettables from "./getTargettables";

export default (YGOPlayer: PlayerValue, card: CardFolder) => {
    return getTargettables(YGOPlayer).some((t) => t.uid.Value === card.uid.Value)
}