import { getCard } from "server/utils";
import type { DuelFolder, PlayerValue } from "server/types";

export default (YGOPlayer: PlayerValue) => {
    const duel = YGOPlayer.FindFirstAncestorWhichIsA("Folder") as DuelFolder;

    return YGOPlayer.targets.Value.split(",").map(uid => {
        return getCard(duel, uid)!
    })
}