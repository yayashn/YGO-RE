import { useEffect, useState } from "@rbxts/roact-hooked";
import useYGOPlayer from "./useYGOPlayer";

export default () => {
    const [playersLP, setLP] = useState({
        playerLP: 8000,
        opponentLP: 8000
    });
    const YGOPlayer = useYGOPlayer()!
    const YGOOpponent = useYGOPlayer(true)!

    useEffect(() => {
        if(!YGOPlayer || !YGOOpponent) return;
        const connections = [
            YGOPlayer.lifePoints.Changed.Connect(() => {
                playersLP.playerLP = YGOPlayer.lifePoints.Value
                setLP(playersLP)
            }),
            YGOOpponent.lifePoints.Changed.Connect(() => {
                playersLP.opponentLP = YGOOpponent.lifePoints.Value
                setLP(playersLP)
            })
        ]

        return () => {
            connections.forEach(connection => connection.Disconnect())
        }
    }, [YGOOpponent, YGOPlayer])

    return { 
        playerLP: playersLP.playerLP,
        opponentLP: playersLP.opponentLP
    };
}