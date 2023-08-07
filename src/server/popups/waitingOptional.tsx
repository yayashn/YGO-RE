import Roact from "@rbxts/roact"
import Dialog from "server/popups/Dialog"

export default (message: string, player: Player) => {
    let waiting: Roact.Tree | undefined = Roact.mount(
        <screengui key="Dialog" IgnoreGuiInset>
            <Dialog message={message}
                options={[
                    {
                        text: "CANCEL",
                        MouseButton1Click: () => {
                            Roact.unmount(waiting!)
                            waiting = undefined;
                        }
                    },
                ]}
            />
        </screengui>, 
        player.FindFirstChildWhichIsA("PlayerGui")
    )

    return [() => {
        Roact.unmount(waiting!)
    }, () => waiting]
}