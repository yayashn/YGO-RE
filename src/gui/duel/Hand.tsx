import Roact from "@rbxts/roact";
import { useRef, withHooks } from "@rbxts/roact-hooked";
import useMount from "gui/hooks/useMount";
import type { CardFolder } from "server/types";

const player = script.FindFirstAncestorWhichIsA("Player")!;
const replicatedStorage = game.GetService("ReplicatedStorage");

type Hand = Model & {
    Center: Part;
}

export const Hand = withHooks(() => {
    return (
        <surfacegui Key="Hand">

        </surfacegui>
    )
})