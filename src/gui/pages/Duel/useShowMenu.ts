import { Signal } from "@rbxts/beacon";
import { useEffect, useState } from "@rbxts/roact-hooked";
import type { Card } from "server/duel/card";

const showMenuSignal = new Signal<Card | undefined>();

export const useShowMenu = () => {
    const [showMenu, setShowMenuState] = useState<Card>();

    useEffect(() => {
        const connection = showMenuSignal.Connect((card) => {
            setShowMenuState(card);
        });

        return () => {
            connection.Disconnect();
        }
    }, [])

    const setShowMenu = (card: Card | undefined) => {
        showMenuSignal.Fire(card);
    }

    return [showMenu, setShowMenu] as const;
}