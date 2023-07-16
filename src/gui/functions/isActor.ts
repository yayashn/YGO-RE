import { YPlayer } from "server/ygo/Player";

export default (player: YPlayer) => {
    const duel = player.getDuel()
    const actor = duel.actor.get()

    return player === actor
}