import Roact, { Portal, StrictMode } from '@rbxts/roact'
import App from './App'
import { HttpService, Players, Workspace } from '@rbxts/services'
import Remotes from 'shared/net/remotes'
import Duel from './pages/Duel/Duel'
import { createRoot } from '@rbxts/react-roblox'
import { includes } from 'shared/utils'

const playerGui = Players.LocalPlayer.WaitForChild('PlayerGui')

let duelRoot: Roact.Tree
Remotes.Client.Get('showField').Connect((bool) => {
    try {
        if (bool) {
            duelRoot = Roact.mount(
                <screengui key={'Duel-'+HttpService.GenerateGUID(false)}>
                    <Duel/>
                </screengui>
            , playerGui, 'Duel')
        } else {
            Workspace.Field3D.Field.GetDescendants().forEach((instance) => {
                if(instance.Name === "Card") {
                    instance.Destroy()
                }
            })
            playerGui.GetChildren().find((instance) => includes(instance.Name, "Duel"))!.Destroy()
            Roact.unmount(duelRoot)
        }
    } catch {

    }
})

const root = createRoot(new Instance('Folder'))
const target = Players.LocalPlayer.WaitForChild('PlayerGui')

root.render(
    <StrictMode>
        <Portal target={target}>
            <App />
        </Portal>
    </StrictMode>
)