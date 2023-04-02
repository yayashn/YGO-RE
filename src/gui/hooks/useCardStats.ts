import { useEffect, useState } from "@rbxts/roact-hooked";
import { CardFolder } from "server/types";
import { includes } from "shared/utils";

export default (card: CardFolder) => {
    const [atk, setAtk] = useState<number>(undefined);
    const [def, setDef] = useState<number>(undefined);

    useEffect(() => {
        if(!card) return;
        if(!includes(card.type.Value, "Monster")) return;

        setAtk(card.atk.Value);
        setDef(card.def.Value);

        const atkConn = card.atk.Changed.Connect((newAtk) => setAtk(newAtk));
        const defConn = card.def.Changed.Connect((newDef) => setDef(newDef));

        return () => {
            atkConn.Disconnect();
            defConn.Disconnect();
        };
    }, [])

    return { atk, def }
}