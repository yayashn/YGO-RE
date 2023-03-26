import { useEffect, useState } from "@rbxts/roact-hooked";
import type { PlayerValue } from "server/types";
import useDuel from "./useDuel";

const player = script.FindFirstAncestorWhichIsA("Player")!;

export default (isOpponent?: boolean) => {
    const duel = useDuel();
    const [YGOPlayer, setYGOPlayer] = useState<PlayerValue>();

    useEffect(() => {
        if(!duel) {
            setYGOPlayer(undefined);
            return;
        };
        
        duel.WaitForChild("player1");
        duel.WaitForChild("player2");
        
        const opponentValue = player === duel.player1.Value ? duel.player2 : duel.player1;
        const playerValue = player === duel.player1.Value ? duel.player1 : duel.player2;

        if(isOpponent) {
            setYGOPlayer(opponentValue);
        } else {
            setYGOPlayer(playerValue);
        }
    }, [duel])

    return YGOPlayer;
}