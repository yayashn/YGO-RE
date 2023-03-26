import { DuelFolder, PlayerValue } from "server/types";

export default (player: PlayerValue) => {
    const duel = player.FindFirstAncestorWhichIsA('Folder') as DuelFolder
    const actor = duel.actor.Value

    return player === actor
}