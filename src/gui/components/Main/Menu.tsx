import Roact from '@rbxts/roact'
import MenuButton from './MenuButton'
import pageState from 'gui/store/pageState'
import { useGlobalState } from 'shared/useGlobalState'
import { withHooks } from '@rbxts/roact-hooked'

export default withHooks(() => {
    const [page, setPage] = useGlobalState(pageState)
    
    return (
        <frame
        LayoutOrder={2}
        BorderSizePixel={0}
        BackgroundTransparency={1}
        Size={new UDim2(0, 170, 0, 37)}
    >
        <uilistlayout
            FillDirection={Enum.FillDirection.Horizontal}
            HorizontalAlignment={Enum.HorizontalAlignment.Right} />
        <uipadding PaddingRight={new UDim(0, 55)} />
        <MenuButton onClick={() => {
            setPage(page === "DECK" ? undefined : "DECK")
        } }
            text="DECK" icon="rbxassetid://4943949493" />
    </frame>
    )
})
