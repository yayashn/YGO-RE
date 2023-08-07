import { useEventListener } from "shared/hooks/useEventListener";
import { useState } from "@rbxts/roact";
import { Phase } from "server/duel/types";
import { DuelRemotes } from "shared/duel/remotes";

const phaseChanged = DuelRemotes.Client.Get("phaseChanged")

export default function usePhase() {
    const [phase, setPhase] = useState<Phase>("DP")

    useEventListener(phaseChanged, (phase) => {
        setPhase(phase)
    })

    return phase
}