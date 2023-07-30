//hoarcekat story ts
import Roact from "@rbxts/roact";

export = (target: Instance) => {
    let tree = Roact.mount(
        <frame></frame>,
        target,
        'UI'
    )

    return () => {
        Roact.unmount(tree)
    }
}
