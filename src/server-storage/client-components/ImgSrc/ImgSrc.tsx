import Roact from "@rbxts/roact"
import { useEffect, useRef, withHooks } from "@rbxts/roact-hooked";
import useIsMounted from "server-storage/useIsMounted";

const clientImage = script.Parent?.FindFirstChildWhichIsA("LocalScript")!;

export default withHooks(({ src, player }: { src: string, player: Player }) => {
    const srcRef = useRef<StringValue>()
    const isMounted = useIsMounted(srcRef as unknown as Roact.Ref<GuiObject>, player)

    useEffect(() => {
        if(!isMounted) return

        const image = clientImage.Clone();
        image.Parent = srcRef.getValue()!

        return () => {
            image.Destroy()
        }
    }, [isMounted])

    return (
        <stringvalue 
        Event={{
            ChildAdded: () => {

            }
        }}
        Ref={srcRef} Value={src} Key="src" />
    )
})