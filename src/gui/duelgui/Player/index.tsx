import Roact from "@rbxts/roact";
import { FieldPlayer, FieldOpponent } from "./Field";
import Hand from "./Hand";
import Alt from "./Alt/index";
import { CardsPlayer, CardsOpponent } from "./Cards/index";

export default () => {
	return (
		<Roact.Fragment>
			<CardsOpponent />
			<FieldOpponent />
			<FieldPlayer />
			<Alt />
			<Hand />
			<CardsPlayer />
		</Roact.Fragment>
	);
};
