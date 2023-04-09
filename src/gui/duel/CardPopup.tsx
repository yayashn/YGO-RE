import Roact from '@rbxts/roact'
import { useEffect, useState, withHooks } from '@rbxts/roact-hooked'
import useIsTarget from 'gui/hooks/useIsTarget'
import useIsTargettable from 'gui/hooks/useIsTargettable'
import useTargettables from 'gui/hooks/useTargettables'
import useYGOPlayer from 'gui/hooks/useYGOPlayer'
import { CardFolder, PlayerValue } from 'server/types'
import { getTargets, removeTarget, addTarget, getCardInfo, getTargettables } from 'server/utils'
import { useGlobalState } from 'shared/useGlobalState'
import { cardInfoStore } from './CardInfo'

export const CardFrame = withHooks(({ card, player }: { card: CardFolder, player: PlayerValue }) => {
    const isTarget = useIsTarget(card)
    const cardInfo = getCardInfo(card.Name)
    const [currentCardInfo, setCurrentCardInfo] = useGlobalState(cardInfoStore)

    return (
        <frame BackgroundTransparency={1}>
            <uilistlayout />
            <imagebutton
                BackgroundTransparency={isTarget ? 0.5 : 0}
                ImageTransparency={isTarget ? 0.5 : 0}
                Event={{
                    MouseButton1Click: () => {
                        const targets = getTargets(player)
                        if (targets.includes(card)) {
                            removeTarget(player, card)
                        } else {
                            addTarget(player, card)
                        }
                    },
                    MouseEnter: () => {
                        setCurrentCardInfo(cardInfo)
                    }
                }}
                Size={new UDim2(1, 0, 1, -20)}
                Image={cardInfo.art.Image}
            />
            <textlabel
                BackgroundTransparency={1}
                Position={new UDim2(0, 0, 1, 0)}
                Size={new UDim2(1, 0, 0, 20)}
                Text={card.location.Value}
                TextColor3={new Color3(1, 1, 1)}
                TextScaled
                TextXAlignment="Center"
                TextYAlignment="Top"
            >
                <uipadding PaddingLeft={new UDim(0, 5)} PaddingRight={new UDim(0, 5)} />
            </textlabel>
        </frame>
    )
})

export default withHooks(() => {
    const player = useYGOPlayer()!
    const targettables = useTargettables()
    const [targettablesHack, setTargettablesHack] = useState<CardFolder[]>([])

    useEffect(() => {
        if(!player) return
        setTargettablesHack(getTargettables(player, player.targettableCards.Value))

    }, [targettables, player])

    if (!player) return <Roact.Fragment />

    return (
        <frame
            BackgroundColor3={new Color3(3 / 255, 20 / 255, 30 / 255)}
            BackgroundTransparency={0.2}
            Position={new UDim2(0.5, 0, 0.5, 0)}
            AnchorPoint={new Vector2(0.5, 0.5)}
            Size={new UDim2(0, 600, 0, 400)}
            BorderSizePixel={0}
        >
            <uistroke Color={new Color3(26 / 255, 101 / 255, 110 / 255)} />
            <uilistlayout
                FillDirection={Enum.FillDirection.Vertical}
                HorizontalAlignment="Center"
            />
            <scrollingframe
                BackgroundTransparency={1}
                AutomaticCanvasSize="Y"
                ScrollBarThickness={2}
                Size={new UDim2(1, 0, 1, 0)}
            >
                <uigridlayout CellSize={new UDim2(0, 70, 0, 120)} />
                {targettablesHack.map((card) => {
                    return (
                        <CardFrame card={card} player={player}/>
                    )
                })}
            </scrollingframe>
        </frame>
    )
})
