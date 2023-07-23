import Roact from "@rbxts/roact";
import Flex from "./components/Flex";
import { withHooks } from "@rbxts/roact-hooked";
import { createGlobalState, useGlobalState } from "shared/useGlobalState";
import { Route } from "shared/libs/router";
import Home from "./pages/Deck/Deck";
import Navbar from "./components/Navbar";
import DeckList from "./pages/DeckList/DeckList";

export default withHooks(() => {
    return (
        <Roact.Fragment>
            <Navbar/>
            <frame 
            BackgroundTransparency={1}
            Size={new UDim2(1,0,1,0)}>
                <Flex justifyContent="center" alignItems="center"/>
                <Route path="/deck/"><Home/></Route>
                <Route path="/decklist/"><DeckList/></Route>
            </frame>
        </Roact.Fragment>
    )
})