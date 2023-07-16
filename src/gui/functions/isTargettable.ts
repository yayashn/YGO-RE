import getTargettables from "./getTargettables";
import { Card } from "server/ygo/Card";
import { YPlayer } from "server/ygo/Player";

export default (YGOPlayer: YPlayer, card: Card) => {
    return getTargettables(YGOPlayer).some((t) => t.uid === card.uid)
}