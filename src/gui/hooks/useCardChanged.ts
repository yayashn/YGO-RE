import { useEffect, useState } from "@rbxts/roact-hooked";
import { Card } from "server/ygo/Card";

export default (card: Card) => {
    const [changed, setChanged] = useState<unknown>()

    useEffect(() => {
        const connections = [card.location, card.position, card.controller].map((value) => {
            return value.event.Connect(() => {
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