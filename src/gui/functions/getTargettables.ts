import type { DuelFolder, PlayerValue } from "server/types";
import { getCard } from "server/utils";

export default (YGOPlayer: PlayerValue) => {
    const duel = YGOPlayer.FindFirstAncestorWhichIsA("Folder") as DuelFolder

    return YGOPlayer.targettableCards.Value.split(",").map(uid => {
        return getCard(duel, uid)!
    })
}