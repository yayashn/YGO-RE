import { useEffect, useState } from "@rbxts/roact-hooked";
import useDuel from "./useDuel";

export default function usechainResolving() {
    const duel = useDuel()
    const [chainResolving, setChainResolving] = useState<boolean>(false)

    useEffect(() => {
        if (duel === undefined) return

        const connection = duel.chainResolving.event.Connect((newState) => {
            setChainResolving(newState)
        })

        return () => connection.Disconnect()
    }, [duel])

    return chainResolving
}