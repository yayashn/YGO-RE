import Roact from "@rbxts/roact"
import { useEffect, useRef, withHooks } from "@rbxts/roact-hooked";
import useIsMounted from "server-storage/useIsMounted";

const localscript = script.Parent?.FindFirstChildWhichIsA("LocalScript")!;

export default withHooks(({ src, player }: { src: string, player: Player }) => {
    const srcRef = useRef<StringValue>()
    const isMounted = useIsMounted(srcRef as unknown as Roact.Ref<GuiObject>, player)

    useEffect(() => {
        if(!isMounted) return

        const ls = localscript.Clone();
        ls.Parent = srcRef.getValue()!

        return () => {
            ls.Destroy()
        }
    }, [isMounted])

    return (
        <stringvalue Ref={srcRef} Value={src} Key="src" />
    )
})