import { useEffect, useState, withHooks } from "@rbxts/roact-hooked";
import { FloodgatePlayer } from "server/functions/floodgates";
import useYGOPlayer from "./useYGOPlayer";

export default () => {
    const player = useYGOPlayer()
    const [floodgates, setFloodgates] = useState<FloodgatePlayer[]>([]);

    useEffect(() => {
        if(!player) return;

        const connection = player.floodgates.event.Connect((value) => {
            setFloodgates(value as unknown as FloodgatePlayer[])
        })

        setFloodgates(player.floodgates.get())

        return () => {
            connection.Disconnect()
        }
    }, [player])

    return floodgates;
}