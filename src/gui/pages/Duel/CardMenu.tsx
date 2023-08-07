import Roact, { useEffect, useRef, useState } from '@rbxts/roact'
import { Players } from '@rbxts/services'
import { includes } from 'shared/utils'
import useCloseMenu from 'gui/hooks/useCloseMenu'
import type { CardAction, CardPublic } from 'server/duel/types'
import { CardRemotes } from 'shared/duel/remotes'
import useShowMenu from 'gui/hooks/useShowMenu'

const doAction = CardRemotes.Client.Get('doAction')

const player = Players.LocalPlayer

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
                <uilistlayout Padding={new UDim(0.05, 0)} VerticalAlignment="Center" />
                {enabledActions?.map((button: CardAction) => {
                    return (
                        <textbutton
                            Size={new UDim2(1, 0, 0, 30)}
                            Text={button}
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextSize={14}
                            TextStrokeColor3={Color3.fromRGB(0, 0, 0)}
                            TextStrokeTransparency={0}
                            TextXAlignment={Enum.TextXAlignment.Center}
                            TextYAlignment={Enum.TextYAlignment.Center}
                            Font={Enum.Font.ArialBold}
                            BorderSizePixel={1}
                            BackgroundColor3={new Color3(6 / 255, 52 / 255, 63 / 255)}
                            BorderColor3={new Color3(26 / 255, 101 / 255, 110 / 255)}
                            Event={{
                                MouseButton1Click: async (e) => {
                                    setShowMenu(undefined)
                                    doAction.SendToServer(card, button)
                                }
                            }}
                        />
                    )
                })}
            </billboardgui>
        </Roact.Fragment>
    )
}