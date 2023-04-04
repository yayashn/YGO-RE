import Roact from '@rbxts/roact'
import { useEffect, useRef, withHooks } from '@rbxts/roact-hooked'
import { Div, Text, Button } from '../shared/rowindcss'
import { useGlobalState, createGlobalState } from 'shared/useGlobalState'
import colours from './main/colours'
import { CardFolder } from 'server/types'
import { ReplicatedStorage } from '@rbxts/services'
import { includes } from 'shared/utils'

const countAtom = createGlobalState(0)

export = (target: Instance) => {
    let tree = Roact.mount(
        <Roact.Fragment>
            <CardOptions />
        </Roact.Fragment>,
        target,
        'UI'
    )

    return () => {
        Roact.unmount(tree)
    }
}

interface PromptProps {
    message: string
    options?: string[]
}

const CardOptionsStore = createGlobalState<CardFolder | undefined>(undefined)

const CardOptions = withHooks(() => {
    const [currentCard, setCurrentCard] = useGlobalState(CardOptionsStore)
    const cardinfo = ReplicatedStorage.FindFirstChild('Blue-Eyes White Dragon', true) as CardFolder
    //array 1-100
    const cards = []
    for (let i = 0; i < 10; i++) {
        cards.push(cardinfo)
    }

    return (
        <frame
            BackgroundColor3={new Color3(3 / 255, 20 / 255, 30 / 255)}
            BackgroundTransparency={0.3}
            BorderSizePixel={0}
            Position={new UDim2(0.5, 0, 0.5, 0)}
            AnchorPoint={new Vector2(0.5, 0.5)}
            Size={new UDim2(0, 600, 0, 400)}
        >
                        <uistroke
                Color={new Color3(26 / 255, 101 / 255, 110 / 255)}
            />
            <uilistlayout
                FillDirection={Enum.FillDirection.Vertical}
                HorizontalAlignment="Center"
            />
            <textlabel
                TextColor3={new Color3(1, 1, 1)}
                Size={new UDim2(1, 0, 0, 50)}
                BackgroundTransparency={1}
                TextSize={24}
                Text="GRAVEYARD"
                Font={Enum.Font.GothamBold}

            />
            <scrollingframe
                BackgroundTransparency={1}
                AutomaticCanvasSize="Y"
                ScrollBarThickness={2}
                Size={new UDim2(1, 0, 1, -50)}
            >
                <uigridlayout CellSize={new UDim2(0, 70, 0, 120)} />
                {cards.map((card, index) => {
                    return <frame BackgroundTransparency={1}>
                        <uilistlayout/>
                        <imagebutton Size={new UDim2(1, 0, 1, -20)}
                        Image={card.art.Image} />
                        <textlabel
                            BackgroundTransparency={1}
                            Position={new UDim2(0, 0, 1, 0)}
                            Size={new UDim2(1, 0, 0, 20)}
                            Text="MZone 2"
                            TextColor3={new Color3(1, 1, 1)}
                            TextScaled
                            TextXAlignment="Center"
                            TextYAlignment="Top">
                                <uipadding 
                                PaddingLeft={new UDim(0,5)} 
                                PaddingRight={new UDim(0,5)}
                                />
                            </textlabel>
                    </frame>
                })}
            </scrollingframe>
        </frame>
    )
})
