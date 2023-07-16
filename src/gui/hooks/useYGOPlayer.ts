import { useEffect, useState } from "@rbxts/roact-hooked";
import useDuel from "./useDuel";
import { YPlayer } from "server/ygo/Player";

const player = script.FindFirstAncestorWhichIsA("Player")!;

export default (isOpponent?: boolean) => {
    const duel = useDuel();
    const [YGOPlayer, setYGOPlayer] = useState<YPlayer>();

    useEffect(() => {
        if(!duel) {
            setYGOPlayer(undefined);
            return;
        };
        
        const opponentValue = player === duel.player1.player ? duel.player2 : duel.player1;
        const playerValue = player === duel.player1.player ? duel.player1 : duel.player2;

        if(isOpponent) {
            setYGOPlayer(opponentValue);
        } else {
            setYGOPlayer(playerValue);
        }
    }, [duel])

    return YGOPlayer;
}