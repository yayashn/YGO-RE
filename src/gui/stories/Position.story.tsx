import Roact from '@rbxts/roact'
import { useEffect, useRef, withHooks } from '@rbxts/roact-hooked'
import { useGlobalState, createGlobalState } from 'shared/useGlobalState'
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
            Size={new UDim2(0, 310, 0, 200)}
        >
            <uistroke Color={new Color3(26 / 255, 101 / 255, 110 / 255)} />
            <uipadding PaddingTop={new UDim(0.5, 0)} />
            <imagebutton
                Event={{
                    
                }}
                Image={cardinfo.art.Image}
                Position={new UDim2(0, 70, 0, 0)}
                AnchorPoint={new Vector2(0.5, 0.5)}
                Size={new UDim2(0, 140 * 0.7, 0, 140)}
            />
            <imagebutton
                Event={{
                    MouseButton1Click: () => {

                    }
                }}
                Image={cardinfo.art.Image}
                Position={new UDim2(0, 220, 0, 0)}
                Rotation={90}
                AnchorPoint={new Vector2(0.5, 0.5)}
                Size={new UDim2(0, 140 * 0.7, 0, 140)}
            />
        </frame>
    )
})
