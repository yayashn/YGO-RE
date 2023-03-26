import Roact from "@rbxts/roact";
import { useEffect, useRef, withHooks } from "@rbxts/roact-hooked";
import { Div, Text, Button } from "./rowindcss";
import { useGlobalState, createGlobalState } from "shared/useGlobalState";

const countAtom = createGlobalState(0)

export = (target: Instance) => {    
    let tree = Roact.mount((
        <Roact.Fragment>
        <Component />
        <Component2 />
        </Roact.Fragment>
    ),
    target, "UI")

    return () => {
        Roact.unmount(tree)
    }
}

const Component = withHooks(() => {
    const [text, setText] = useGlobalState(countAtom)

    return (
        <Button Event={{
            MouseButton1Click: () => {
                setText(text + 1)
            }
        }}
        className="w-40 h-40" Text={`${text}`}/>
    )
})

const Component2 = withHooks(() => {
    const [text, setText] = useGlobalState(countAtom)

    return (
        <Button Event={{
            MouseButton1Click: () => {
                setText(text + 1)
            }
        }}
        className="w-40 h-40 left-20" Text={`${text}`}/>
    )
})