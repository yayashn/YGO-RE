import Roact from "@rbxts/roact";
import { useEffect, useRef, withHooks } from "@rbxts/roact-hooked";
import { getPlayer, remote } from "shared/utils";
import useIsUIMounted from "gui/hooks/useIsUIMounted";

const player = getPlayer(script);

export default withHooks(() => {
    const HandRef = useRef<SurfaceGui>();
    const isMounted = useIsUIMounted(HandRef);

    useEffect(() => {
        if(isMounted) {
            const handGui = HandRef.getValue()!;
            handGui.ChildAdded.Connect((card) => {
                remote<RemoteFunction>("handLayout").InvokeClient(player, card, "added");
            })
            handGui.ChildRemoved.Connect((card) => {
                remote<RemoteFunction>("handLayout").InvokeClient(player, card, "removed");
            })
        }
    }, [isMounted])

    return (
        <surfacegui Ref={HandRef} Key="HandPlayer">

        </surfacegui>
    )
})