import Roact from "@rbxts/roact";
import { atom, useAtom } from "shared/jotai";

const countAtom = atom(0)

 function App() {
    const [count, setCount] = useAtom(countAtom)

    return (
        <Roact.Fragment>
            <textbutton
                Event={{
                    MouseButton1Click: () => {
                        setCount(count + 1)
                    }
                }}
                Text={`Count: ${count}`}
                Size={new UDim2(0, 200, 0, 50)}
            />
        </Roact.Fragment>
    )
}

export = (target: Instance) => {
    let tree = Roact.mount(
        <App/>,
        target,
        'UI'
    )

    return () => {
        Roact.unmount(tree)
    }
}