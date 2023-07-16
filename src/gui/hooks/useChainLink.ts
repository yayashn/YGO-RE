import { useEffect, useState } from "@rbxts/roact-hooked"
import { Card } from "server/ygo/Card"

export default (card: Card) => {
    const [chainLink, setChainLink] = useState(0)

    useEffect(() => {
            const connection = card.chainLink.event.Connect((value) => {
                setChainLink(value)
            })
            
            return () => {
                connection.Disconnect()
            }
    }, [])

    return chainLink
}