import { YPlayer } from "server/ygo/Player";

export default (YGOPlayer: YPlayer) => {
    return YGOPlayer.targettableCards.get().map(card => {
        return card 
    })
}