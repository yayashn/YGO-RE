import Roact, { Ref } from "@rbxts/roact";
import { useEffect, useState } from "@rbxts/roact-hooked";
import { CardGui } from "shared/types";
import { getPlayer } from "shared/utils";

const player = getPlayer(script);
const playerGui = player.FindFirstChild("PlayerGui")!;

export default (uiRef: Ref<GuiObject | CardGui | SurfaceGui>) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const ui = uiRef.getValue();
        if(ui) {
            if(ui.FindFirstAncestorWhichIsA("PlayerGui") === undefined) {
                const connection = playerGui.DescendantAdded.Connect((descendant) => {
                    if(descendant === ui) {
                        setIsMounted(true);
                        connection.Disconnect();
                    }
                });
            } else {
                setIsMounted(true);
            }
        }
    }, []);

    return isMounted;
}