import { useEffect, useState } from "@rbxts/roact-hooked";
import useYGOPlayer from "./useYGOPlayer";

export default function usePrompt() {
    const player = useYGOPlayer()
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
