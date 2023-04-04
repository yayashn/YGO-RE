import Roact from "@rbxts/roact"
import Dialog from "./Dialog"

export default async (player: Player, message: string) => {
    return new Promise<"YES" | "NO">((resolve) => {
        const prompt = Roact.mount(
            <screengui Key="Dialog" IgnoreGuiInset>
                <Dialog message={message}
                    options={[
                        {
                            text: "NO",
                            MouseButton1Click: () => {
                                Roact.unmount(prompt)
                                resolve("NO")
                            }
                        },
                        {
                            text: "YES",
                            MouseButton1Click: () => {
                                Roact.unmount(prompt)
                                resolve("YES")
                            }
                        }
                    ]}
                />
            </screengui>, 
            player.FindFirstChildWhichIsA("PlayerGui")
        )
    })
}