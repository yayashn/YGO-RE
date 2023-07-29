import { useEffect } from "@rbxts/roact-hooked";
import { getProfile } from "server/profile-service/profiles";
import type { PlayerData } from "server/types";
import { createGlobalState, useGlobalState } from "shared/useGlobalState";

const player = script.FindFirstAncestorWhichIsA("Player")!;
export const playerDataStore = createGlobalState<PlayerData | undefined>(undefined)

export default function useInitPlayerData() {
    const [_, setPlayerData] = useGlobalState(playerDataStore)
    const profileChanged = player.WaitForChild("profileChanged") as BindableEvent;
    useEffect(() => {   
        setPlayerData(getProfile(player)?.Data);
        const connection = profileChanged.Event.Connect(() => {
            setPlayerData({...getProfile(player)!.Data});
        })

        return () => {
            connection.Disconnect();
        }
    }, [])
}
