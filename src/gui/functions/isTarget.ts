
import getTargets from "./getTargets";
import { YPlayer } from "server/ygo/Player";
import { Card } from "server/ygo/Card";

export default (YGOPlayer: YPlayer, card: Card) => {
    return getTargets(YGOPlayer).some((t) => t.uid === card.uid)
}