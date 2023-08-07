import { useState } from "@rbxts/roact";
import { PlayerRemotes } from "shared/duel/remotes";
import { useEventListener } from "shared/hooks/useEventListener";

const lpChanged = PlayerRemotes.Client.Get("lpChanged")

export default function useLP() {
    const [lp, setLP] = useState({ playerLP: 8000, opponentLP: 8000 })

    useEventListener(lpChanged, (newLP) => {
        setLP(newLP)
    })

    return lp
}