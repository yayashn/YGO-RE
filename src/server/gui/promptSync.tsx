import Roact from "@rbxts/roact";
import Dialog from "./Dialog";
import { YPlayer } from "server/ygo/Player";

export default (player: YPlayer, message: string) => {
    let inputReceived: boolean = false;
    let receivedInput: string = "";

    const handleInput = (input: string) => {
        inputReceived = true;
        receivedInput = input;
    };

    const prompt = Roact.mount(
        <screengui Key="Dialog" IgnoreGuiInset>
            <Dialog
                message={message}
                player={player.player}
                handleInput={handleInput}
                options={[
                    {
                        text: "Cancel",
                        MouseButton1Click: () => {
                            Roact.unmount(prompt);
                            inputReceived = true;
                            receivedInput = "";
                        },
                    },
                    {
                        text: "Submit",
                        MouseButton1Click: () => {
                            Roact.unmount(prompt);
                            inputReceived = true;
                        },
                    },
                ]}
            />
        </screengui>,
        player.player.FindFirstChildWhichIsA("PlayerGui")
    );

    while (inputReceived) {
        wait();
    }

    return receivedInput;
};
