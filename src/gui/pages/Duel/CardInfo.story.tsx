//hoarcekat story ts
import Roact from "@rbxts/roact";
import CardSearch from "./CardSearch";

export = (target: Instance) => {
    let tree = Roact.mount(
        <CardSearch/>,
        target,
        'UI'
    )

    return () => {
        Roact.unmount(tree)
    }
}
