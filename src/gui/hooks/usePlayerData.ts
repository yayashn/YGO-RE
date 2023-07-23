import { useGlobalState } from "shared/useGlobalState";
import { playerDataStore } from "./useInitPlayerData";

export default function usePlayerData() {
    const [playerData] = useGlobalState(playerDataStore);

    return playerData;
}