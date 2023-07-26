//hoarcekat story ts
import Roact from "@rbxts/roact";
import CardInfo from "./CardInfo";

export = (target: Instance) => {
    let tree = Roact.mount(
        <CardInfo/>,
        target,
        'UI'
    )

    return () => {
        Roact.unmount(tree)
    }
}
