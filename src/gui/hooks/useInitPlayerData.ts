import { useEffect } from "@rbxts/roact-hooked";
import { getProfile } from "server/profile-service/profiles";
import type { PlayerData } from "server/types";
import { createGlobalState, useGlobalState } from "shared/useGlobalState";

const player = script.FindFirstAncestorWhichIsA("Player")!;
export const playerDataStore = createGlobalState<PlayerData | undefined>(undefined)

export default function useInitPlayerData() {
    print(1)
    const [_, setPlayerData] = useGlobalState(playerDataStore)
    print(2)
    const profileChanged = player.WaitForChild("profileChanged") as BindableEvent;
print(3)
    useEffect(() => {   
        print(3.5)
        setPlayerData(getProfile(player)?.Data);
print(4)
        const connection = profileChanged.Event.Connect(() => {
            setPlayerData({...getProfile(player)!.Data});
        })

        return () => {
            connection.Disconnect();
        }
    }, [])
}
