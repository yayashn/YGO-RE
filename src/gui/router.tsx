import Roact from "@rbxts/roact"
import { useEffect, useRef, withHooks } from "@rbxts/roact-hooked"
import { createGlobalState, useGlobalState } from "shared/useGlobalState"

export const routeState = createGlobalState("/")

interface RouteProps extends Roact.PropsWithChildren {
    path: string
}

export const Route = withHooks((props: RouteProps) => {
    const [route, setRoute] = useGlobalState(routeState);

    return (
        <Roact.Fragment>
            {route.match(`^${props.path}`).size() > 0 && props[Roact.Children]}
        </Roact.Fragment>
    )
})

export const useNavigate = () => {
    const [_, setRoute] = useGlobalState(routeState)

    return (path: string) => setRoute(path)
}

export const useRoute = () => {
    const [route] = useGlobalState(routeState)

    return route
}