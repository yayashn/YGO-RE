import Roact from "@rbxts/roact";
import Phases from "./Phases";
import Field from "./Field";
import Cards from "./Cards";
import CardInfo from "./CardInfo";
import CardSearch from "./CardSearch";
import Zones from "./ZoneButtons";
import LifePoints from "./LifePoints";

export default function Duel() {
    return (
        <Roact.Fragment>
            <Phases/>
            <Field/>
            <Cards/>
            <CardInfo/>
            <CardSearch/>
            <Zones/>
            <LifePoints/>
        </Roact.Fragment>
    )
}