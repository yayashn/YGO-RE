//hoarcekat story ts
import Roact from "@rbxts/roact";
import App from "./App";
import { useGlobalState } from "shared/useGlobalState";
import { playerDataStore } from "./hooks/useInitPlayerData";
import { useEffect, withHooks } from "@rbxts/roact-hooked";
import defaultPlayerData from "server/profile-service/default-data";

const DataApp = withHooks(() => {
    const [_, setPlayerData] = useGlobalState(playerDataStore)

    useEffect(() => {
        setPlayerData({...defaultPlayerData})
    }, [])

    return (
        <App/>
    )
})

export = (target: Instance) => {
    let tree = Roact.mount(
        <DataApp/>,
        target,
        'UI'
    )

    return () => {
        Roact.unmount(tree)
    }
}
