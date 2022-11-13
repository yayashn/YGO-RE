import Roact from "@rbxts/roact";
import Field from "./Field";
import Hand from "./Hand";
import Alt from "./Alt/index";
import Cards from "./Cards/index";

export default () => {
    return (
        <Roact.Fragment>
            <Field/>
            <Alt/>
            <Hand/>
            <Cards/>
        </Roact.Fragment>
    )
}