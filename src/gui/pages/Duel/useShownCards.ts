import { Signal } from "@rbxts/beacon";
import { useEffect, useState } from "@rbxts/roact-hooked";
import type { Card } from "server/duel/card";

const showCardsSignal = new Signal<[val: Card[] | undefined]>();

export const useShownCards = () => {
    const [showMenu, setShowMenuState] = useState<Card[]>();

    useEffect(() => {
        const connection = showCardsSignal.Connect((card) => {
            setShowMenuState(card);
        });

        return () => {
            connection.Disconnect();
        }
    }, [])

    const setShowMenu = (card: Card[]| undefined) => {
        showCardsSignal.Fire(card);
    }

    return [showMenu, setShowMenu] as const;
}