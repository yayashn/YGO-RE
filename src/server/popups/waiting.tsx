import Roact from "@rbxts/roact"
import Dialog from "server/popups/Dialog"

export default (message: string, player: Player) => {
    const waiting = Roact.mount(
        <screengui Key="Dialog" IgnoreGuiInset>
            <Dialog message={message}/>
        </screengui>, 
        player.FindFirstChildWhichIsA("PlayerGui")
    )

    return () => {
        Roact.unmount(waiting)
    }
}