import Roact from "@rbxts/roact";
import Flex from "../shared/components/Flex";
import { useEffect, useRef, withHooks } from "@rbxts/roact-hooked";
import { Route, useNavigate, useRoute } from "gui/router";
import Home from "./pages/Deck/Deck";
import Navbar from "./components/Navbar";
import DeckList from "./pages/DeckList/DeckList";
import Shop from "./pages/Shop/Shop";
import PackOpen from "./pages/Shop/PackOpen";
import Duel from "./pages/Duel/Duel";
import Remotes from "shared/net";

export default withHooks(() => {
    const route = useRoute()
    const navigate = useNavigate()
    const forceRoute = useRef<StringValue>();

    useEffect(() => {
        const connection = forceRoute.getValue()?.Changed.Connect((newRoute) => {
            navigate(newRoute)
        })

        return () => connection?.Disconnect()
    }, [])

    return (
        <Roact.Fragment>
            <stringvalue Ref={forceRoute} Key="route" />
            {route.match("^/duel/").size() === 0 && <Navbar />}
            <frame
                BackgroundTransparency={1}
                Size={new UDim2(1, 0, 1, 0)}>
                <Flex justifyContent="center" alignItems="center" />
                {route.match("^/duel/").size() === 0 &&
                    <Roact.Fragment>
                        <Route path="/deck/"><Home /></Route>
                        <Route path="/decklist/"><DeckList /></Route>
                        <Route path="/shop/"><Shop /></Route>
                    </Roact.Fragment>
                }
            </frame>
            <PackOpen />
        </Roact.Fragment>
    )
})