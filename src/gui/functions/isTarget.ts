import type { CardFolder, PlayerValue } from "server/types";
import getTargets from "./getTargets";

export default (YGOPlayer: PlayerValue, card: CardFolder) => {
    return getTargets(YGOPlayer).some((t) => t.uid.Value === card.uid.Value)
}