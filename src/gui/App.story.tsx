//hoarcekat story ts
import Roact from "@rbxts/roact";
import App from "./App";
import { withHooks } from "@rbxts/roact-hooked";

const DataApp = withHooks(() => {
    return (
        <App/>
    )
})

export = (target: Instance) => {
    let tree = Roact.mount(
        <DataApp/>,
        target,
        'UI'
    )

    return () => {
        Roact.unmount(tree)
    }
}
