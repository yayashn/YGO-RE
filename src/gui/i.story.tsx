import Roact from "@rbxts/roact";
import App from "./App";

export = (target: Instance) => {
    let tree = Roact.mount(
        <App/>,
        target,
        'UI'
    )

    return () => {
        Roact.unmount(tree)
    }
}//ok