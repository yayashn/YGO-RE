import { useEffect, useState } from "@rbxts/roact-hooked";
import type { Card } from "server/duel/card";

type CardStatType<T, K extends keyof T = keyof T> = K extends keyof T ? (T[K] extends { get: () => infer U } ? K : never) : never;

export default function useCardStat<T extends keyof Card, U>(card: Card, statType: CardStatType<Card, T>): U {
    const [stat, setStat] = useState<U>(card[statType].get() as U);
    
    useEffect(() => {
        const connection = card[statType].changed((value: U) => {
            //print(statType)
            setStat(value);
        })

        return () => {
            connection.Disconnect();
        }
    }, [])

    return stat;
}