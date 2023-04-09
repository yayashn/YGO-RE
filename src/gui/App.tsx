import Roact from '@rbxts/roact'
import { withHooks } from '@rbxts/roact-hooked'
import Main from './components/Main/Main'
import { useGlobalState } from 'shared/useGlobalState'
import pageState  from "./store/pageState"
import Deck from './pages/Deck/Deck'

export default withHooks(() => {
    const [page, setPage] = useGlobalState(pageState)

    return (
        <frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
            <Main/>
            <Deck/>
        </frame>
    )
})
