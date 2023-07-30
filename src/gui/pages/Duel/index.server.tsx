import Roact from "@rbxts/roact";
import { withHooks } from "@rbxts/roact-hooked";
import Duel from "./Duel";
import { createInstance } from "shared/utils";

const player = script.FindFirstAncestorWhichIsA("Player")!
const startDuel = createInstance('BindableEvent', 'startDuel', player);

startDuel.Event.Connect(() => {
    mount = Roact.mount(
        <DuelGui />,
        player?.FindFirstChildWhichIsA("PlayerGui"),
        'Duel'
    )    
})

const DuelGui = withHooks(() => {

    return (
        <screengui
            Key="App"
            IgnoreGuiInset>
            <Duel />
            <bindableevent
                Key="endDuel"
                Event={{
                    Event: () => {
                        Roact.unmount(mount);
                    }
                }}
                />
        </screengui>
    )
})

let mount: Roact.Tree;