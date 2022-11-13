import Roact from "@rbxts/roact";
import { useEffect, useRef, useState, withHooks } from "@rbxts/roact-hooked";
import { getPlayer, remote } from "shared/utils";
import useIsUIMounted from "gui/hooks/useIsUIMounted";
import { useGlobalState } from "gui/hooks/useGlobalState";
import { cardsState } from "gui/duelgui/State/cardState";
import { moveCard } from "shared/ygoField";
import { CardGui } from "shared/types";
import { YGOCard } from ".";

const player = getPlayer(script);

interface Props {
    index: number;
}

export default withHooks(({index}: Props) => {
    const [cards, setCards] = useGlobalState<YGOCard[]>(cardsState);
    const card = cards[index];
    const cardRef = useRef<CardGui>();
    const imageRef = useRef<SurfaceGui>();
    const isMounted = useIsUIMounted(cardRef);
    const sleeve = (player.WaitForChild("sleeve") as StringValue).Value;
    const [getCardInfoPrivate, setGetCardInfoPrivate] = useState(new Instance("BindableFunction"));
    const [getCardInfoPublic, setGetCardInfoPublic] = useState(new Instance("RemoteFunction"));

    useEffect(() => {
        if(isMounted) {
            const cardButton = cardRef.getValue()!;
            const card3D = new Instance("ObjectValue", cardButton);
            card3D.Name = "card3D";

            getCardInfoPrivate.Name = "getCardInfo";
            getCardInfoPrivate.OnInvoke = () => {
                return card;
            }
            getCardInfoPrivate.Parent = cardButton;

            getCardInfoPublic.Name = "getCardInfoPublic";
            getCardInfoPublic.OnServerInvoke = () => {
                return {
                    position: card.position,
                    face: card.face,
                    location: card.location,
                    owner: card.owner,
                    control: card.control
                }
            }
            getCardInfoPublic.Parent = cardButton;

            remote<RemoteEvent>("createCard3D").FireClient(player, cardButton);
        }
    }, [isMounted])

    useEffect(() => {
        if(isMounted) {
            getCardInfoPublic.OnServerInvoke = () => {
                return {
                    position: card.position,
                    face: card.face,
                    location: card.location,
                    owner: card.owner,
                    control: card.control
                }
            }
            getCardInfoPrivate.OnInvoke = () => {
                return card;
            }
            moveCard(player, cardRef.getValue()!);
        }
    }, [card])

    return (
        <Roact.Fragment>
            <surfacegui Key="card" Ref={cardRef}>
                <surfacegui Ref={imageRef} Key="image">
                    <imagelabel Image={sleeve}/>
                </surfacegui>
                <surfacegui Key="sleeve">
                    <imagelabel Image={sleeve}/>
                </surfacegui>
            </surfacegui>
        </Roact.Fragment>
    )
})