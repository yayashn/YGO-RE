import Roact from "@rbxts/roact"
import { useEffect, useState, withHooks } from "@rbxts/roact-hooked"
import useYGOPlayer from "gui/hooks/useYGOPlayer"
import { getCard, getCardInfo } from "server/utils"
import { Card } from "server/ygo/Card"

export default withHooks(() => {
    const player = useYGOPlayer();
    const [card, setCard] = useState<Card | undefined>(undefined);
    const cardInfo = card && getCardInfo(card.name);

    useEffect(() => {
        if(!player) return;

        const duel = player.getDuel();
        const connection = player.selectPositionCard.event.Connect((cardUid) => {
            try {
                if(cardUid === "") {
                    setCard(undefined)
                } else {
                    setCard(getCard(duel, cardUid))
                }
            } catch {
                setCard(undefined)
            }
        })

        return () => {
            connection.Disconnect()
        }
    }, [player])

    if(!card || !cardInfo) return <Roact.Fragment/>

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
                MouseButton1Click: () => {
                    card.controller.get().selectedPosition.set("FaceUpAttack")
                }
            }}
            Image={cardInfo.art.Image as string}
            Position={new UDim2(0, 70, 0, 0)}
            AnchorPoint={new Vector2(0.5, 0.5)}
            Size={new UDim2(0, 140 * 0.7, 0, 140)}
        />
        <imagebutton
            Event={{
                MouseButton1Click: () => {
                    card.controller.get().selectedPosition.set("FaceUpDefense")
                }
            }}
            Image={cardInfo.art.Image as string}
            Position={new UDim2(0, 220, 0, 0)}
            Rotation={90}
            AnchorPoint={new Vector2(0.5, 0.5)}
            Size={new UDim2(0, 140 * 0.7, 0, 140)}
        />
    </frame>
    )
})