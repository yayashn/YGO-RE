import Roact from "@rbxts/roact";
import { useEffect, useRef, withHooks } from "@rbxts/roact-hooked";
import useClass from "./useClass";


export = (target: Instance) => {    
    let tree = Roact.mount((
        <Component />
    ),
    target, "UI")

    return () => {
        Roact.unmount(tree)
    }
}

const Component = withHooks(() => {
    const className = useClass<TextLabel>("w-20 h-20")
    const ref = useRef<TextLabel>()

    return (
        <textlabel {...className}
        Ref={ref}
        BackgroundColor3={Color3.fromHex("#000")} 
        Text="hi" 
        TextColor3={Color3.fromHex("#fff")}>
            
        </textlabel>
    )
})