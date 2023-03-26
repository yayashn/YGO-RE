import { useEffect, useState } from "@rbxts/roact-hooked";
import type { CardFolder } from "server/types";

export default (card: CardFolder) => {
    const [changed, setChanged] = useState<unknown>()

    useEffect(() => {
        const connections = [card.location, card.position, card.controller].map((value) => {
            return value.Changed.Connect(() => {
                setChanged(value)
            })
        })

        return () => {
            connections.forEach((connection) => {
                connection.Disconnect()
            })
        }
    }, [])

    useEffect(() => {
        if(changed !== undefined) {
            setChanged(undefined)
        }
    }, [changed])

    return changed
}