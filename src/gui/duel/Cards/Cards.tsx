import Roact from '@rbxts/roact'
import { withHooks, useRef, useState, Dispatch, SetStateAction, useEffect } from '@rbxts/roact-hooked'
import useCards from 'gui/hooks/useCards'
import useMount from 'gui/hooks/useMount'
import useShowArt from 'gui/hooks/useShowArt'
import useYGOPlayer from 'gui/hooks/useYGOPlayer'
import { getCardInfo } from 'server/utils'
import { instance } from 'shared/utils'
import isTargettableF from 'gui/functions/isTargettable'
import isTargetF from 'gui/functions/isTarget'
import useIsTarget from 'gui/hooks/useIsTarget'
import useIsTargettable from 'gui/hooks/useIsTargettable'
import removeTarget from 'gui/functions/removeTarget'
import addTarget from 'gui/functions/addTarget'
import CardMenu from './CardMenu'
import { cardInfoStore } from 'gui/duel/CardInfo'
import { useGlobalState } from 'shared/useGlobalState'
import { motion } from 'shared/motion'
import HoverCard from 'server-storage/animations/HoverCard/HoverCard'
import useLocation from 'gui/hooks/useLocation'
import { YPlayer } from 'server/ygo/Player'
import { Card } from 'server/ygo/Card'

const replicatedStorage = game.GetService('ReplicatedStorage')
const player = script.FindFirstAncestorWhichIsA('Player')!
const playerGui = player.WaitForChild('PlayerGui') as PlayerGui
const createCard3D = replicatedStorage.FindFirstChild('createCard3D.re', true) as RemoteEvent
const moveCard3D = replicatedStorage.FindFirstChild('moveCard3D.re', true) as RemoteEvent
const tweenService = game.GetService('TweenService')

export default withHooks(({ PlayerValue }: { PlayerValue: YPlayer }) => {
    const cards = useCards(PlayerValue.player)
    const [showMenu, setShowMenu] = useState<string | false>(false)
    const duel = PlayerValue.getDuel()

    useEffect(() => {
        const connection = duel.phase.event.Connect((value) => {
            setShowMenu(false)
        })

        return () => {
            connection.Disconnect()
        }
    }, [])

    return (
        <surfacegui Key="Cards">
            {cards?.map((card, i) => {
                return <CardButton useShowMenu={[showMenu, setShowMenu]} Key={i} card={card} />
            })}
        </surfacegui>
    )
})

export type CardButton = {
    card: Card
    getPosition?: RemoteFunction
    card3D?: ObjectValue
    getOrder?: RemoteFunction
    getUid?: RemoteFunction
    positionChanged?: RemoteEvent
    getLocation?: RemoteFunction,
    useShowMenu?: [string | false, Dispatch<SetStateAction<string | false>>]
    onCardClick?: RemoteEvent
}

export interface DuelGuiPlayerField extends SurfaceGui {
    MZone1: TextButton
    MZone2: TextButton
    MZone3: TextButton
    MZone4: TextButton
    MZone5: TextButton
    SZone1: TextButton
    SZone2: TextButton
    SZone3: TextButton
    SZone4: TextButton
    SZone5: TextButton
}
export interface DuelGuiPlayer extends SurfaceGui {
    BZone: SurfaceGui
    GZone: SurfaceGui
    EZone: SurfaceGui
    Deck: SurfaceGui
    Field: DuelGuiPlayerField
    Hand: SurfaceGui
    FZone: SurfaceGui
}
export interface DuelGui extends ScreenGui {
    Field: {
        Player: DuelGuiPlayer
        Opponent: DuelGuiPlayer
    }
}

export const CardButton = withHooks(({ card, useShowMenu }: CardButton) => {
    const duelGui = playerGui.WaitForChild('DuelGui') as DuelGui
    const YGOPlayer = useYGOPlayer()!
    const cardRef = useRef<SurfaceGui>()
    const showArt = useShowArt(card)
    const [hover, setHover] = useState(false)
    const [showMenu, setShowMenu] = useShowMenu!
    const isTarget = useIsTarget(card)
    const isTargettable = useIsTargettable(card)
    const [currentCardInfo, setCurrentCardInfo] = useGlobalState(cardInfoStore)
    const [enlarged, setEnlarged] = useState(false)
    const location = useLocation(card)

    useEffect(() => {
        setEnlarged(hover || card.location.get() !== "Hand")
    }, [hover, location])

    useMount(
        () => {
            const connections: RBXScriptConnection[] = []

            const card3DValue = new Instance('ObjectValue')
            card3DValue.Value = cardRef.getValue()
            card3DValue.Name = 'card3D'
            card3DValue.Parent = cardRef.getValue()
            card.cardButton.Value = cardRef.getValue()!

            const onCardClick = instance(
                'RemoteEvent',
                'onCardClick',
                cardRef.getValue(),
            ) as RemoteEvent
            const clicked = (player: Player) => {
                if (isTargettableF(YGOPlayer, card)) {
                    setShowMenu(false)
                    if (isTargetF(YGOPlayer, card)) {
                        removeTarget(YGOPlayer, card)
                    } else {
                        addTarget(YGOPlayer, card)
                    }
                } else {
                    setShowMenu((state) => state !== card.uid ? card.uid : false)
                }
            }
            connections.push(onCardClick.OnServerEvent.Connect(clicked))

            const isOpponent = () => card.controller.get().player !== YGOPlayer.player

            createCard3D.FireClient(
                player,
                cardRef.getValue(),
                {
                    location: card.location.get(),
                },
                isOpponent(),
            )

            const cardLocationChanged = () => {
                if (!isOpponent()) {
                    cardRef.getValue()!.Parent = duelGui.Field.Player.FindFirstChild(
                        card.location.get(),
                        true,
                    )
                } else {
                    cardRef.getValue()!.Parent = duelGui.Field.Opponent.FindFirstChild(
                        card.location.get(),
                        true,
                    )
                }
                moveCard3D.FireClient(player, cardRef.getValue(), card.location.get(), isOpponent())
            }
            connections.push(card.location.event.Connect(cardLocationChanged))
            cardLocationChanged()

            const positionChanged = instance(
                'RemoteEvent',
                'positionChanged',
                cardRef.getValue(),
            ) as RemoteEvent
            connections.push(card.position.event.Connect(() => {
                positionChanged.FireClient(player, card.position.get())
            }))

            const getLocationFromClient = instance(
                'RemoteFunction',
                'getLocation',
                cardRef.getValue(),
            ) as RemoteFunction;
            getLocationFromClient.OnServerInvoke = () => {
                return card.location.get()
            }

            const getPositionFromClient = instance(
                'RemoteFunction',
                'getPosition',
                cardRef.getValue(),
            ) as RemoteFunction
            getPositionFromClient.OnServerInvoke = () => {
                return card.position.get()
            }

            const getOrderFromClient = instance(
                'RemoteFunction',
                'getOrder',
                cardRef.getValue(),
            ) as RemoteFunction
            getOrderFromClient.OnServerInvoke = () => {
                return card.order.get()
            }

            const getUidFromClient = instance(
                'RemoteFunction',
                'getUid',
                cardRef.getValue(),
            ) as RemoteFunction
            getUidFromClient.OnServerInvoke = () => {
                return card.uid
            }

            return () => {
                connections.forEach((connection) => connection.Disconnect())
            }
        },
        [],
        cardRef,
    )

    return (
        <surfacegui Ref={cardRef} Key="Card">
            <CardMenu card={card} useShowMenu={[showMenu === card.uid, setShowMenu]} />
            <surfacegui Key="Art" Face="Bottom">
                <imagelabel
                    ImageTransparency={0}
                    Size={new UDim2(1, 0, 1, 0)}
                    BackgroundTransparency={1}
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    Position={new UDim2(0.5, 0, 0.5, 0)}
                    Image={
                        showArt
                            ? (getCardInfo(card.name).FindFirstChild('art') as ImageButton).Image
                            : ''
                    }
                    Event={{
                        MouseEnter: () => {
                            setHover(true)
                            if(showArt) {
                                setCurrentCardInfo(card.name)
                            }
                        },
                        MouseLeave: () => {
                            setHover(false)
                        },
                    }}
                >
                    <HoverCard
                        playAnimation={enlarged}
                    />
                    {(isTargettable && !isTarget) && <motion.uistroke
                        Thickness={20}
                        Color={new Color3(0.8, 0.2, 0.2)}
                        Transparency={0}
                        animate={{
                            Transparency: 1,
                            transition: {
                                duration: 0.6,
                                easingStyle: Enum.EasingStyle.Quad,
                                repeatCount: -1,
                            }
                        }}
                    />}
                    {isTarget && <motion.uistroke
                        Thickness={30}
                        Color={new Color3(0.2, 0.8, 0.2)}
                    />}
                </imagelabel>
            </surfacegui>

            <surfacegui Key="Sleeve" Face="Top">
                <imagelabel
                    ImageTransparency={0}
                    Size={new UDim2(1, 0, 1, 0)}
                    BackgroundTransparency={1}
                    Image={
                        (card.controller.get().player.FindFirstChild('sleeve') as StringValue).Value
                    }
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    Position={new UDim2(0.5, 0, 0.5, 0)}
                    Event={{
                        MouseEnter: () => {
                            setHover(true)
                            if(showArt) {
                                setCurrentCardInfo(card.name)
                            }
                        },
                        MouseLeave: () => {
                            setHover(false)
                        },
                    }}
                >
                    <HoverCard
                        playAnimation={enlarged}
                    />
                    {(isTargettable && !isTarget) && <motion.uistroke
                        Thickness={20}
                        Color={new Color3(0.2, 0.8, 0.2)}
                        Transparency={0}
                        animate={{
                            Transparency: 1,
                            transition: {
                                duration: 0.6,
                                easingStyle: Enum.EasingStyle.Quad,
                                repeatCount: -1,
                            }
                        }}
                    />}
                    {isTarget && <motion.uistroke
                        Thickness={30}
                        Color={new Color3(0.2, 0.8, 0.2)}
                    />}
                </imagelabel>
            </surfacegui>
        </surfacegui>
    )
})