import Roact from "@rbxts/roact";
import { useEffect, useRef, useState, withHooks } from "@rbxts/roact-hooked";
import { getPlayer, remote } from "shared/utils";
import useIsUIMounted from "gui/hooks/useIsUIMounted";
import { CardGui } from "shared/types";
import moveCard from "shared/moveCard";
import YGOCard from "shared/ygo/card";

const player = getPlayer(script);

interface Props {
	card: YGOCard;
}

export default withHooks(({ card }: Props) => {
	const cardRef = useRef<CardGui>();
	const imageRef = useRef<SurfaceGui>();
	const isMounted = useIsUIMounted(cardRef);
	const sleeve = (player.WaitForChild("sleeve") as StringValue).Value;
	const [getCardInfoPrivate, setGetCardInfoPrivate] = useState(new Instance("BindableFunction"));
	const [getCardInfoPublic, setGetCardInfoPublic] = useState(new Instance("RemoteFunction"));

	useEffect(() => {
		if (isMounted) {
			const cardButton = cardRef.getValue()!;
			const card3D = new Instance("ObjectValue", cardButton);
			card3D.Name = "card3D";

			getCardInfoPrivate.Name = "getCardInfo";
			getCardInfoPrivate.OnInvoke = () => {
				return card;
			};
			getCardInfoPrivate.Parent = cardButton;

			getCardInfoPublic.Name = "getCardInfoPublic";
			getCardInfoPublic.OnServerInvoke = () => {
				return {
					position: card.position,
					face: card.face,
					location: card.location,
					owner: card.ownerName,
					controller: card.controllerName,
				};
			};
			getCardInfoPublic.Parent = cardButton;

			remote<RemoteEvent>("createCard3D").FireClient(player, cardButton);
		}
	}, [isMounted]);

	useEffect(() => {
		if (isMounted) {
			getCardInfoPublic.OnServerInvoke = () => {
				const { location, face, ownerName, controllerName, position } = card;
				return {
					position,
					face,
					location,
					ownerName,
					controllerName,
				};
			};
			getCardInfoPrivate.OnInvoke = () => {
				return card;
			};
			moveCard(player, cardRef.getValue()!);
		}
	}, [card]);

	return (
		<Roact.Fragment>
			<surfacegui Key="card" Ref={cardRef}>
				<surfacegui Ref={imageRef} Key="image">
					<imagelabel Image={sleeve} />
				</surfacegui>
				<surfacegui Key="sleeve">
					<imagelabel Image={sleeve} />
				</surfacegui>
			</surfacegui>
		</Roact.Fragment>
	);
});
