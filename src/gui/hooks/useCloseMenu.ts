import { useState } from "@rbxts/roact";
import { PlayerRemotes } from "shared/duel/remotes";
import { useEventListener } from "shared/hooks/useEventListener";

const closeMenu = PlayerRemotes.Client.Get("closeMenu")

export default function useCloseMenu() {
    const [state, setState] = useState(0)

    useEventListener(closeMenu, () => {
        setState(state => state + 1)
    })

    return state
}