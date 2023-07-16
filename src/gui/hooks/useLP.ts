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
            YGOPlayer.lifePoints.event.Connect(() => {
                playersLP.playerLP = YGOPlayer.lifePoints.get()
                setLP(playersLP)
            }),
            YGOOpponent.lifePoints.event.Connect(() => {
                playersLP.opponentLP = YGOOpponent.lifePoints.get()
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