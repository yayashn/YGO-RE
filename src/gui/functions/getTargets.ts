import { getCard } from "server/utils";
import { YPlayer } from "server/ygo/Player";

export default (YGOPlayer: YPlayer) => {
    const duel = YGOPlayer.getDuel()

    return YGOPlayer.targets.get().map(card => {
        return getCard(duel, card.uid)!
    })
}