import Roact from "@rbxts/roact"
import Dialog from "./Dialog"

export default async (player: Player, message: string) => {
    return new Promise<"OK">((resolve) => {
        const prompt = Roact.mount(
            <screengui Key="Dialog" IgnoreGuiInset>
                <Dialog message={message}
                    options={[
                        {
                            text: "OK",
                            MouseButton1Click: () => {
                                Roact.unmount(prompt)
                                resolve("OK")
                            }
                        },
                    ]}
                />
            </screengui>, 
            player.FindFirstChildWhichIsA("PlayerGui")
        )
    })
}