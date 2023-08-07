import Roact from '@rbxts/roact'
import App from './App'
import { Players } from '@rbxts/services'
import Remotes from 'shared/net/remotes'
import Duel from './pages/Duel/Duel'

const playerGui = Players.LocalPlayer.WaitForChild('PlayerGui')

Roact.mount(<App />, playerGui, 'App')

let duelRoot: Roact.Tree;
Remotes.Client.Get('showField').Connect((bool) => {
    if (bool) {
        duelRoot = Roact.mount(<Duel />, playerGui, 'Duel')
    } else {
        Roact.unmount(duelRoot)
    }
})
