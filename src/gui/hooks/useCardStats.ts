import { useEffect, useState } from "@rbxts/roact-hooked";
import { every } from "@rbxts/sift/out/Array";
import { Card } from "server/ygo/Card";
import { includes } from "shared/utils";

export default (card: Card) => {
    const [atk, setAtk] = useState<number>(undefined);
    const [def, setDef] = useState<number>(undefined);

    useEffect(() => {
        if(!card) return;
        if(!includes(card["type"].get(), "Monster")) return;

        setAtk(card.atk.get());
        setDef(card.def.get());

        const atkConn = card.atk.event.Connect((newAtk) => setAtk(newAtk));
        const defConn = card.def.event.Connect((newDef) => setDef(newDef));

        return () => {
            atkConn.Disconnect();
            defConn.Disconnect();
        };
    }, [])

    return { atk, def }
}