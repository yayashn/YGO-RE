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
            <CardInfo />
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

const cardInfoStore = createGlobalState<CardFolder | undefined>(undefined)

const CardInfo = withHooks(() => {
    const [currentCard, setCurrentCard] = useGlobalState(cardInfoStore)
    const cardInfo = ReplicatedStorage.FindFirstChild('Blue-Eyes White Dragon', true) as CardFolder
    const cardColour = includes(cardInfo.type.Value, 'Monster')
        ? Color3.fromRGB(255, 124, 16)
        : includes(cardInfo.type.Value, 'Spell')
        ? Color3.fromRGB(3, 255, 180)
        : Color3.fromRGB(166, 12, 255)

    return (
        <frame
            BackgroundColor3={new Color3(0, 0, 0)}
            BackgroundTransparency={0.5}
            BorderSizePixel={0}
            Position={new UDim2(0, 0, 0, 0)}
            Size={new UDim2(0, 300, 1, 0)}
        >
            <uilistlayout />
            {cardInfo && (
                <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 0)} AutomaticSize="Y">
                    <uilistlayout FillDirection="Vertical" Padding={new UDim(0, 10)} />
                    <imagelabel Image={cardInfo.art.Image} Size={new UDim2(0, 200, 0, 300)} />
                    <frame
                        AutomaticSize="Y"
                        BackgroundTransparency={1}
                        Size={new UDim2(1, 0, 1, 0)}
                    >
                        <uilistlayout Padding={new UDim(0, 2)} SortOrder={'LayoutOrder'} />
                        <uipadding PaddingLeft={new UDim(0, 5)} />
                        <textlabel
                            LayoutOrder={1}
                            BackgroundTransparency={1}
                            TextYAlignment={Enum.TextYAlignment.Top}
                            TextXAlignment={Enum.TextXAlignment.Left}
                            AutomaticSize={Enum.AutomaticSize.Y}
                            TextSize={16}
                            TextWrapped={true}
                            Size={new UDim2(1, 0, 0, 25)}
                            TextColor3={cardColour}
                            Text={cardInfo.Name}
                        />
                        {includes(cardInfo.type.Value, 'Monster') && (
                            <Roact.Fragment>
                                <textlabel
                                    LayoutOrder={2}
                                    BackgroundTransparency={1}
                                    TextYAlignment={Enum.TextYAlignment.Top}
                                    TextXAlignment={Enum.TextXAlignment.Left}
                                    AutomaticSize={Enum.AutomaticSize.Y}
                                    TextSize={12}
                                    TextWrapped={true}
                                    Size={new UDim2(1, 0, 0, 0)}
                                    TextColor3={cardColour}
                                    Text={`LV: ${cardInfo.level.Value}`}
                                />
                                <textlabel
                                    LayoutOrder={3}
                                    BackgroundTransparency={1}
                                    TextYAlignment={Enum.TextYAlignment.Top}
                                    TextXAlignment={Enum.TextXAlignment.Left}
                                    AutomaticSize={Enum.AutomaticSize.Y}
                                    TextSize={12}
                                    TextWrapped={true}
                                    Size={new UDim2(1, 0, 0, 0)}
                                    TextColor3={cardColour}
                                    Text={`${cardInfo.atk.Value} / ${cardInfo.def.Value}`}
                                />
                            </Roact.Fragment>
                        )}
                        <textlabel
                            LayoutOrder={4}
                            BackgroundTransparency={1}
                            TextYAlignment={Enum.TextYAlignment.Top}
                            TextXAlignment={Enum.TextXAlignment.Left}
                            AutomaticSize={Enum.AutomaticSize.Y}
                            TextSize={12}
                            TextWrapped={true}
                            Size={new UDim2(1, 0, 0, 0)}
                            TextColor3={cardColour}
                            Text={cardInfo.type.Value}
                        />
                                                <textlabel
                            LayoutOrder={5}
                            BackgroundTransparency={1}
                            TextYAlignment={Enum.TextYAlignment.Top}
                            TextXAlignment={Enum.TextXAlignment.Left}
                            AutomaticSize={Enum.AutomaticSize.Y}
                            TextSize={12}
                            TextWrapped={true}
                            Size={new UDim2(1, 0, 0, 0)}
                            TextColor3={cardColour}
                            Text={cardInfo.race.Value}
                        />
                        <textlabel
                            LayoutOrder={6}
                            BackgroundTransparency={1}
                            TextYAlignment={Enum.TextYAlignment.Top}
                            TextXAlignment={Enum.TextXAlignment.Left}
                            AutomaticSize={Enum.AutomaticSize.Y}
                            TextSize={12}
                            TextWrapped={true}
                            Size={new UDim2(1, 0, 0, 0)}
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            Text={cardInfo.desc.Value}
                        />
                    </frame>
                </frame>
            )}
        </frame>
    )
})
