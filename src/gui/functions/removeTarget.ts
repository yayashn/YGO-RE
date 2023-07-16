import type { CardFolder, PlayerValue } from "server/types";
import formatTargets from "./formatTargets";
import { YPlayer } from "server/ygo/Player";
import { Card } from "server/ygo/Card";

export default (YGOPlayer: YPlayer, card: Card) => {
    const targets = YGOPlayer.targets.get().filter((c) => c !== card);
    YGOPlayer.targets.set(targets);
}