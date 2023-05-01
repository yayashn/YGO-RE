import Roact from "@rbxts/roact";
import { useEffect, useRef, withHooks } from "@rbxts/roact-hooked";

interface Props {
    playAnimation: boolean | undefined;
}

export default withHooks(({playAnimation}: Props) => {
    const playAnimationRef = useRef<BoolValue>()

    useEffect(() => {
        const animation = (script.Parent!.FindFirstChild("animation") as LocalScript).Clone()
        animation.Parent = playAnimationRef.getValue()!

        return () => {
            animation.Destroy()
        }
    }, [])

    return (
        <boolvalue 
        Ref={playAnimationRef}
        Key="playAnimation" 
        Value={playAnimation}/>
    )
})