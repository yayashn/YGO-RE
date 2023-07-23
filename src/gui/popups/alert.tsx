import Roact from "@rbxts/roact"
import Dialog from "gui/components/Dialog"

const plr = script.FindFirstAncestorWhichIsA("Player")!;

export default async (message: string, player: Player = plr) => {
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