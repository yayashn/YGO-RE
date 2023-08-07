import Roact, { useEffect, useRef, useState } from "@rbxts/roact"
import { Players } from "@rbxts/services"
import { CardAction, CardPublic } from "server/duel/types"
import useIsTargettable from "gui/hooks/useIsTargettable"
import useIsTarget from "gui/hooks/useIsTarget"
import CardMenu from "./CardMenu"
import { get3DZone, includes } from "shared/utils"
import { useEventListener } from "shared/hooks/useEventListener"
import { CardRemotes, PlayerRemotes } from "shared/duel/remotes"
import useShowMenu from "gui/hooks/useShowMenu"
import useHoveredCard from "gui/hooks/useHoveredCard"
import { CardStatus } from "./CardStatus"

const card3DTemplate = game.Workspace.Field3D.Card;

interface Props {
    card: CardPublic
}

const player = Players.LocalPlayer
const tweenService = game.GetService('TweenService')
const cardChanged = CardRemotes.Client.Get("cardChanged")
const handleCardClick = PlayerRemotes.Client.Get("handleCardClick")
const tweenInfoHand = new TweenInfo(0.15, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0)

export default ({ card: c }: Props) => {
    const [card, setCard] = useState(c)
    const location = card.location
    const card2DRef = useRef<SurfaceGui>()
    const isTargettable = useIsTargettable(card)
    const isTarget = useIsTarget(card)
    const card3DRef = useRef<Part>(card3DTemplate.Clone())
    const [hoveredCard, setHoveredCard] = useHoveredCard()
    const [hover, setHover] = useState(false)
    const [showMenu, setShowMenu] = useShowMenu()
    const sleeveRef = useRef<ImageButton>()
    const artRef = useRef<ImageButton>()
    const tweeningRef = useRef<BoolValue>()
    const positionChangedRef = useRef<BindableEvent>()
    const [enabledActions, setEnabledActions] = useState<CardAction[]>([]);

    const ButtonEvents = {
        MouseButton1Click: async () => {
            const shouldShowMenu = await handleCardClick.CallServerAsync(card);
            if(shouldShowMenu !== false) {
                setShowMenu({...card})
                setEnabledActions(shouldShowMenu)
            } else {
                setShowMenu(undefined)
                setEnabledActions([])
            }
        },
        MouseEnter: () => {
            if(hoveredCard !== card) {
                setHoveredCard(card)
            }
        },
        MouseLeave: () => {
            if(hoveredCard === card) {
                setHoveredCard(undefined)
            }
        },
    }

    useEffect(() => {
        (card3DRef.current.FindFirstChild("card2D") as ObjectValue).Value = card2DRef.current
        positionChangedRef.current?.Fire(card.position);
        new Promise(() => {
            let count = 0;
            while (count < 10) {
                wait(1);
                (card2DRef.current?.WaitForChild("Status") as BillboardGui).Enabled = true;
                count++;
            }
        })
    }, [])

    useEventListener(cardChanged, (newCard) => {
        if(newCard.uid !== c.uid) return
        setCard({...newCard})
    })

    useEffect(() => {
        positionChangedRef.current?.Fire(card.position)
        wait()
        card3DRef.current.Parent = get3DZone(card.location, card.controller !== player);
    }, [card])

    useEffect(() => {
        if(!artRef.current) return
        if(!sleeveRef.current) return
        if(card.location === "Hand") {
            if(hover) {
                const tweenGoal = { Size: new UDim2(1, 0, 1, 0) }
                tweenService.Create(artRef.current, tweenInfoHand, tweenGoal).Play()
                tweenService.Create(sleeveRef.current, tweenInfoHand, tweenGoal).Play()
            } else {
                const tweenGoal = { Size: new UDim2(0.8, 0, 0.8, 0) }
                tweenService.Create(artRef.current, tweenInfoHand, tweenGoal).Play()
                tweenService.Create(sleeveRef.current, tweenInfoHand, tweenGoal).Play()
            }
        } else {
            artRef.current.Size = new UDim2(1, 0, 1, 0)
            sleeveRef.current.Size = new UDim2(1, 0, 1, 0)
        }
    }, [hover, card, artRef, sleeveRef])

    return (
        <surfacegui ref={card2DRef}>
            <surfacegui 
            Adornee={card3DRef.current}
            ZOffset={-1} AlwaysOnTop key="Art" Face="Bottom">
                <imagebutton
                    Event={ButtonEvents}
                    ImageTransparency={0}
                    Size={location !== 'Hand' ? new UDim2(1, 0, 1, 0) : new UDim2(0.8, 0, 0.8, 0)}
                    BackgroundTransparency={1}
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    Position={new UDim2(0.5, 0, 0.5, 0)}
                    Image={card.art}
                    ref={artRef}
                >
                    {isTargettable && !isTarget ? (
                        <uistroke Color={Color3.fromRGB(255, 165, 0)} Thickness={30} />
                    ) : isTarget ? (
                        <uistroke Color={Color3.fromRGB(0, 255, 0)} Thickness={30} />
                    ) : (
                        <Roact.Fragment />
                    )}
                </imagebutton>
            </surfacegui>

            <surfacegui 
            Adornee={card3DRef.current}
            AlwaysOnTop key="Sleeve" Face="Top">
                <imagebutton
                    ref={sleeveRef}
                    Event={ButtonEvents}
                    ImageTransparency={0}
                    Size={location !== 'Hand' ? new UDim2(1, 0, 1, 0) : new UDim2(0.8, 0, 0.8, 0)}
                    BackgroundTransparency={1}
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    Position={new UDim2(0.5, 0, 0.5, 0)}
                    Image="rbxassetid://3955072236"
                    >
                        {isTargettable && !isTarget ? (
                            <uistroke Color={Color3.fromRGB(255, 165, 0)} Thickness={30} />
                        ) : isTarget ? (
                            <uistroke Color={Color3.fromRGB(0, 255, 0)} Thickness={30} />
                        ) : (
                            <Roact.Fragment />
                        )}
                    </imagebutton>
                </surfacegui>
                <CardMenu 
                enabledActions={enabledActions}
                Adornee={card3DRef.current} card={card} />
                <CardStatus Adornee={card3DRef.current} card={card}/>
                <objectvalue key="card3D" Value={card3DRef.current} />
                <objectvalue key="card2D" Value={card2DRef.current} />
                <numbervalue key="order" Value={card.order} />
                <boolvalue 
                ref={tweeningRef}
                key="tweening" Value={false} />
                <bindableevent 
                ref={positionChangedRef}
                key="positionChanged" />
                <bindablefunction 
                OnInvoke={() => {
                    return card
                }}
                key="getCard"/>
            </surfacegui>
        )
    }
    