import { useEffect, useState } from "@rbxts/roact-hooked";
import type { YPlayer } from "server/duel/player";

type PlayerStatType<T, K extends keyof T = keyof T> = K extends keyof T ? (T[K] extends { get: () => infer U } ? K : never) : never;

export default function usePlayerStat<T extends keyof YPlayer, U>(yPlayer: YPlayer, statType: PlayerStatType<YPlayer, T>): U {
    const [stat, setStat] = useState<U>(yPlayer[statType].get() as U);
    
    useEffect(() => {
        const connection = yPlayer[statType].changed((value: U) => {
            setStat(value);
        })

        return () => {
            connection.Disconnect();
        }
    }, [])

    return stat;
}