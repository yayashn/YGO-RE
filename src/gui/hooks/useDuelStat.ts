import { useEffect, useState } from "@rbxts/roact-hooked";
import type { Duel } from "server/duel/duel";

type DuelStatType<T, K extends keyof T = keyof T> = K extends keyof T ? (T[K] extends { get: () => infer U } ? K : never) : never;

export default function useDuelStat<T extends keyof Duel, U>(Duel: Duel, statType: DuelStatType<Duel, T>): U {
    const [stat, setStat] = useState<U>(Duel[statType].get() as U);
    
    useEffect(() => {
        const connection = Duel[statType].changed((value: U) => {
            setStat(value);
        })

        return () => {
            connection.Disconnect();
        }
    }, [])

    return stat;
}