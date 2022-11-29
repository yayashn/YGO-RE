import Roact from "@rbxts/roact";
import { useEffect, withHooks } from "@rbxts/roact-hooked";
import Card from "../Cards/Card";
import { useGlobalState } from "gui/hooks/useGlobalState";
import { cardsState } from "gui/duelgui/State/cardState";
import { getPlayer } from "shared/utils";
import useOpponentCards from "gui/hooks/useOpponentCards";
import YGOCard from "shared/ygo/card";

const player = getPlayer(script);

export const CardsPlayer = withHooks(() => {
	const [cards, setCards] = useGlobalState<YGOCard[]>(cardsState);

	useEffect(() => {
		const card: YGOCard = new YGOCard(
			"Dark Magician",
			player.Name,
			player.Name,
			"Hand",
			"atk",
			"up",
		);
		setCards([card]);
	}, []);

	return (
		<surfacegui Key="CardsPlayer">
			{cards.map((card) => {
				return <Card card={card} />;
			})}
		</surfacegui>
	);
});

export const CardsOpponent = withHooks(() => {
	const opponentCards = useOpponentCards();

	return (
		<surfacegui Key="CardsOpponent">
			{opponentCards.map((card) => {
				return <Card card={card} />;
			})}
		</surfacegui>
	);
});
