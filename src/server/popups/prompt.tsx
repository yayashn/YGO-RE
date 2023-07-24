import Roact from "@rbxts/roact";
import Dialog from "server/popups/Dialog";

export default async (message: string, player: Player) => {
    return new Promise<string>((resolve) => {
        const handleInput = (input: string) => {
            resolve(input);
        };

        const prompt = Roact.mount(
            <screengui Key="Dialog" IgnoreGuiInset>
                <Dialog
                    message={message}
                    player={player}
                    handleInput={handleInput}
                    options={[
                        {
                            text: "Cancel",
                            MouseButton1Click: () => {
                                Roact.unmount(prompt);
                                resolve("");
                            },
                        },
                        {
                            text: "Submit",
                            MouseButton1Click: () => {
                                Roact.unmount(prompt);
                            },
                        },
                    ]}
                />
            </screengui>,
            player.FindFirstChildWhichIsA("PlayerGui")
        );
    });
};