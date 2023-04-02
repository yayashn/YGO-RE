import { useEffect, useState } from "@rbxts/roact-hooked";
import useYGOPlayer from "./useYGOPlayer";
import { PlayerValue } from "server/types";

export const waitingText = "Waiting for opponent to respond...";

export default function usePrompt(player: PlayerValue) {
    const [prompt, setPrompt] = useState<string>("")

    useEffect(() => {
        if (player === undefined) return

        const connection = player.promptMessage.Changed.Connect((newPrompt) => {
            setPrompt(newPrompt)
        })

        return () => connection.Disconnect()
    }, [player])

    return prompt
}
