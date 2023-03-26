import type { CardFolder, PlayerValue } from "server/types";
import formatTargets from "./formatTargets";

export default (YGOPlayer: PlayerValue, card: CardFolder) => {
    const targets = YGOPlayer.targets.Value.split(",").filter((uid) => card.uid.Value !== uid);
    YGOPlayer.targets.Value = formatTargets(targets);
}