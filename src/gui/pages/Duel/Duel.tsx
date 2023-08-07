import Roact from "@rbxts/roact";
import Phases from "./Phases";
import Field from "./Field";
import Cards from "./Cards";

export default function Duel() {
    return (
        <Roact.Fragment>
            <Phases/>
            <Field/>
            <Cards/>
        </Roact.Fragment>
    )
}