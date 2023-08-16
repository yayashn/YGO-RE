import Roact from "@rbxts/roact"
import Dialog from "server/popups/Dialog"

const options = async (message: string, player: Player, options: string[]) => {
    return new Promise<string>((resolve) => {
        const prompt = Roact.mount(
            <screengui Key="Dialog" IgnoreGuiInset>
                <Dialog message={message}
                    options={options.map((option) => {
                        return {
                            text: option,
                            MouseButton1Click: () => {
                                Roact.unmount(prompt)
                                resolve(option)
                            }
                        }
                    })}
                />
            </screengui>, 
            player.FindFirstChildWhichIsA("PlayerGui")
        )
    })
}

export default options