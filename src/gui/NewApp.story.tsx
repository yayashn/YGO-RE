import Roact from "@rbxts/roact";
import Menu from "./components/Menu/Menu";

export = (target: Instance) => {
    let tree = Roact.mount(
        <Menu/>,
        target,
        'UI'
    )

    return () => {
        Roact.unmount(tree)
    }
}