import { getCard } from "server/utils";
import { DuelFolder, PlayerValue } from "server/ygo";

export default (YGOPlayer: PlayerValue) => {
    const duel = YGOPlayer.FindFirstAncestorWhichIsA("Folder") as DuelFolder;

    return YGOPlayer.targets.Value.split(",").map(uid => {
        return getCard(duel, uid)!
    })
}