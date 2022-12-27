import Roact from "@rbxts/roact";

const replicatedStorage = game.GetService("ReplicatedStorage");
const cards = replicatedStorage.WaitForChild("cards") as Folder;

const sets = ['legend of blue eyes white dragon']

const playerGui = script.FindFirstAncestorWhichIsA("Player")!.FindFirstChildWhichIsA("PlayerGui")!;

Roact.mount(
    <screengui>
        <frame 
        Size={new UDim2(.5,0,.5,0)}
        Position={new UDim2(1,0,1,0)}>
            <uigridlayout/>
            {sets.map((setName) => {
                return (
                    <Roact.Fragment>
                        {cards.FindFirstChild(setName)!.GetChildren().map((card) => {
                            return <imagebutton Size={new UDim2(0,1,0,1)} 
                            Image={card.FindFirstChildWhichIsA("ImageButton")!.Image}>
                            </imagebutton>
                        })} 
                    </Roact.Fragment>
                )
            })}
        </frame>
    </screengui>
, playerGui, "LoadGui")