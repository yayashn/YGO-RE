import Roact from "@rbxts/roact";
import { useRef, withHooks } from "@rbxts/roact-hooked";
import useMount from "gui/hooks/useMount";
import { CardFolder } from "server/ygo";

const player = script.FindFirstAncestorWhichIsA("Player")!;
const replicatedStorage = game.GetService("ReplicatedStorage");

type Hand = Model & {
    Center: Part;
}

export const Hand = withHooks(() => {
    const handRef = useRef<SurfaceGui>()

    useMount(() => {
        handRef.getValue()!.ChildAdded.Connect((cardButton) => {
          const cardFolder = (cardButton.WaitForChild("cardFolder") as ObjectValue).Value as CardFolder 
          
        })
    }, [], handRef)

    return (
        <surfacegui Key="Hand">

        </surfacegui>
    )
})