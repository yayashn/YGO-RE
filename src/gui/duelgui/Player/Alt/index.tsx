import Roact from "@rbxts/roact";
import Zone from "./AltZone";

export default () => {
	return (
		<surfacegui Key="AltPlayer">
			{["Deck", "EZone", "GZone", "BZone", "FZone"].map((name) => {
				return <Zone name={name} />;
			})}
		</surfacegui>
	);
};
