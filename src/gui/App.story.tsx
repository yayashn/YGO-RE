//hoarcekat story ts
import Roact from "@rbxts/roact";
import App from "./App";
import { withHooks } from "@rbxts/roact-hooked";
import Shop from "./pages/Shop/Shop";

const DataApp = withHooks(() => {
    return (
        <Shop/>
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
