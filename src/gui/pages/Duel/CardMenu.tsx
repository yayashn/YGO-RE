import Roact, { useEffect, useRef } from '@rbxts/roact'
import useCloseMenu from 'gui/hooks/useCloseMenu'
import type { CardAction, CardPublic } from 'server/duel/types'
import { CardRemotes } from 'shared/duel/remotes'
import useShowMenu from 'gui/hooks/useShowMenu'
import { black } from 'shared/colours'
import Padding from 'shared/components/Padding'

const doAction = CardRemotes.Client.Get('doAction')

export default ({
    card,
    Adornee,
    enabledActions
}: {
    card: CardPublic
    Adornee: Part
    enabledActions: CardAction[]
}) => {
    const [showMenu, setShowMenu] = useShowMenu()
    const closeMenu = useCloseMenu()
    const statusRef = useRef<BillboardGui>()

    useEffect(() => {
        if (!statusRef.current) return
        statusRef.current.Enabled = true
    }, [statusRef])

    useEffect(() => {
        try {
            if ((showMenu as CardPublic).uid === card.uid) {
                setShowMenu(undefined)
            }
        } catch {}
    }, [closeMenu])

    return (
        <Roact.Fragment>
            <billboardgui
                Enabled={showMenu ? showMenu.uid === card.uid : false}
                Active={true}
                key="CardMenu"
                Adornee={Adornee}
                AlwaysOnTop={true}
                Size={new UDim2(70, 0, 100, 0)}
                ExtentsOffset={new Vector3(0, 0.2, 2)}
                ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
            >
                <uilistlayout Padding={new UDim(0.05, 0)} VerticalAlignment="Center" HorizontalAlignment="Center" />
                {enabledActions?.map((button: CardAction) => {
                    return (
                        <textbutton
                            Size={new UDim2(.9, 0, 
                                card.location === "Hand" ? 0.15 : 0.3
                                , 0)}
                            Text={button}
                            BackgroundTransparency={.2}
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextSize={card.location === "Hand" ? 20 : 30}
                            TextWrap
                            TextScaled={card.location !== "Hand"}
                            TextStrokeColor3={Color3.fromRGB(0, 0, 0)}
                            BackgroundColor3={black}
                            TextStrokeTransparency={0}
                            TextXAlignment={Enum.TextXAlignment.Center}
                            TextYAlignment={Enum.TextYAlignment.Center}
                            Font={Enum.Font.ArialBold}
                            BorderSizePixel={0}
                            Event={{
                                MouseButton1Click: async (e) => {
                                    setShowMenu(undefined)
                                    doAction.SendToServer(card, button)
                                }
                            }}
                        >
                            <uicorner CornerRadius={new UDim(0, 5)} />
                            <Padding PaddingBlock={new UDim(0, 
                                card.location === "Hand" ? 10 : 0
                                )} />
                        </textbutton>
                    )
                })}
            </billboardgui>
        </Roact.Fragment>
    )
}