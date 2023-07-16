import { useEffect, useState } from "@rbxts/roact-hooked";
import { YPlayer } from "server/ygo/Player";

export const waitingText = "Waiting for opponent to respond...";

export default function usePrompt(player: YPlayer) {
    const [prompt, setPrompt] = useState<string>("")

    useEffect(() => {
        if (player === undefined) return

        const connection = player.promptMessage.event.Connect((newPrompt) => {
            setPrompt(newPrompt)
        })

        return () => connection.Disconnect()
    }, [player])

    return prompt
}
