import Roact from "@rbxts/roact"
import { withHooks } from "@rbxts/roact-hooked"
import Cards from "./Cards"
import Field from "./Field";
import Phases from "./Phases";

export default withHooks(() => {
    return (
        <Roact.Fragment>
            <frame 
            BackgroundTransparency={1}
            Size={new UDim2(1,0,1,0)}>
                
            </frame>
            <Phases/>
            <Field/>
            <Cards/>
        </Roact.Fragment>
    )
})