import { CardFolder, PlayerValue } from "server/ygo";
import formatTargets from "./formatTargets";

export default (YGOPlayer: PlayerValue, card: CardFolder) => {
    const targets = YGOPlayer.targets.Value.split(",");
    targets.push(card.uid.Value);
    YGOPlayer.targets.Value = formatTargets(targets);
}