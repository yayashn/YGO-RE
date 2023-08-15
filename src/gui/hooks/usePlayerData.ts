import { useEventListener } from "shared/hooks/useEventListener";
import { useState } from "@rbxts/roact";
import Remotes from "shared/net/remotes";
import type { PlayerData } from "server/types";

const profileChanged = Remotes.Client.Get("profileChanged")
const getProfile = Remotes.Client.Get("getProfile")

export default function usePlayerData() {
    const [player, setPlayer] = useState<PlayerData>(getProfile.CallServer())

    useEventListener(profileChanged, (newData) => {
        setPlayer(newData)
    })

    return player
}