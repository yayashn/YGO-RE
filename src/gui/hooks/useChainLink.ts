import { useEffect, useState } from "@rbxts/roact-hooked"
import { CardFolder } from "server/types"

export default (card: CardFolder) => {
    const [chainLink, setChainLink] = useState(0)

    useEffect(() => {
            const connection = card.chainLink.Changed.Connect((value) => {
                setChainLink(value)
            })
            
            return () => {
                connection.Disconnect()
            }
    }, [])

    return chainLink
}