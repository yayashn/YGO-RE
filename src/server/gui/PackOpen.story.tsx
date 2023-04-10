import Roact from "@rbxts/roact";
import colours from "shared/colours";
import { CardFolder } from "server/types";
import { motion } from "shared/motion";
import { getCardData } from "shared/utils";
import { useState, withHooks } from "@rbxts/roact-hooked";

//Pack Open Animation 1 by 1.

interface Props {
    cards: CardFolder[]
    callback: Callback
}
const PackOpen = withHooks(({cards, callback}: Props) => {
    const [cardsState, setCardsState] = useState(cards)

    return (
        <frame
            Position={new UDim2(0.5, 0, 0.5, 0)}
            AnchorPoint={new Vector2(0.5, 0.5)}
            Size={new UDim2(1,0 , 0, 200)}
            BackgroundTransparency={1}
        >
            <uilistlayout
                FillDirection={Enum.FillDirection.Vertical}
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
            />
            <frame
                Size={new UDim2(1, 0, 1, 0)}
                BackgroundTransparency={1}
            >
                <uilistlayout
                    FillDirection={Enum.FillDirection.Horizontal}
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    Padding={new UDim(0, 5)}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                />
                {cardsState.map((card, i) => {
                    return (
                        <frame
                            Size={new UDim2(0, 150, 0, 150)}
                            BackgroundTransparency={1}
                            LayoutOrder={i}
                        >
                            <uiaspectratioconstraint
                                AspectRatio={59/86}
                            />
                            <motion.imagebutton
                                ImageTransparency={1}
                                animate={{
                                    ImageTransparency: 0,
                                    transition: {
                                        delay: i * 0.5,
                                        duration: 0.5,
                                    }
                                }}
                                Image={card.art.Image}
                                Size={new UDim2(1, 0, 1, 0)}
                                BackgroundTransparency={1}
                            >
                            </motion.imagebutton>
                        </frame>
                    )
                })}
            </frame>
            <motion.textbutton 
                Event={{
                    MouseButton1Click: () => {
                        setCardsState([])
                        callback()
                    }
                }}
                TextTransparency={1}
                BackgroundTransparency={1}
                animate={{
                    TextTransparency: 0,
                    BackgroundTransparency: 0,
                    transition: {
                        delay: cards.size() * 0.5,
                    }
                }}
                Text="Close"
                Size={new UDim2(0, 100, 0, 50)}
                BackgroundColor3={colours.background}
                BorderSizePixel={2}
                BorderColor3={colours.outline}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                Font={Enum.Font.GothamBlack}
                TextSize={20}
            />
        </frame>
    )
})


const testCards = [
    getCardData("Blue-Eyes White Dragon") as CardFolder,
    getCardData("Blue-Eyes White Dragon") as CardFolder,
    getCardData("Blue-Eyes White Dragon") as CardFolder,
    getCardData("Blue-Eyes White Dragon") as CardFolder,
    getCardData("Blue-Eyes White Dragon") as CardFolder,
    getCardData("Blue-Eyes White Dragon") as CardFolder,
    getCardData("Blue-Eyes White Dragon") as CardFolder,
    getCardData("Blue-Eyes White Dragon") as CardFolder,
    getCardData("Blue-Eyes White Dragon") as CardFolder,
]

export = (target: Instance) => {
    let tree = Roact.mount(
        <PackOpen cards={testCards}
            callback={() => {}}
        />,
        target,
        'UI'
    )

    return () => {
        Roact.unmount(tree)
    }
}