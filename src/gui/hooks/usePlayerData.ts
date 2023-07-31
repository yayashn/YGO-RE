import { useEffect, useState } from "@rbxts/roact-hooked";
import type { PlayerData } from "server/types";
import { createGlobalState, useGlobalState } from "shared/useGlobalState";

const player = script.FindFirstAncestorWhichIsA("Player")!;

export const playerDataStore = createGlobalState<PlayerData | undefined>(undefined);

export default function usePlayerData() {
    const profileChanged = player.FindFirstChild("profileChanged") as BindableEvent;
    const [playerData, setPlayerData] = useGlobalState(playerDataStore);
    
    useEffect(() => {   
        const connection = profileChanged.Event.Connect((data) => {
            setPlayerData(data);
        })

        return () => {
            connection.Disconnect();
        }
    }, [])

    return playerData;
}
