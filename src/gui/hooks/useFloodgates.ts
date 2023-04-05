import { useEffect, useState, withHooks } from "@rbxts/roact-hooked";
import { FloodgatePlayer, getFloodgates } from "server/functions/floodgates";
import useYGOPlayer from "./useYGOPlayer";

export default () => {
    const player = useYGOPlayer()
    const [floodgates, setFloodgates] = useState<FloodgatePlayer[]>([]);

    useEffect(() => {
        if(!player) return;

        const connection = player.floodgates.Changed.Connect((value) => {
            setFloodgates(getFloodgates(player, value))
        })

        setFloodgates(getFloodgates(player))

        return () => {
            connection.Disconnect()
        }
    }, [player])

    return floodgates;
}