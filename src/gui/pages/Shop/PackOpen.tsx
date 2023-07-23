import Roact from "@rbxts/roact";
import { motion } from "shared/motion";
import { useState, withHooks } from "@rbxts/roact-hooked";
import { createGlobalState, useGlobalState } from "shared/useGlobalState";
import theme from "shared/theme";
import { CardTemplate } from "server/types";
import getCardData from "shared/utils";

export const showPackOpenStore = createGlobalState<CardTemplate[]>([])

export default withHooks(() => {
    const [showPackOpen, setShowPackOpen] = useGlobalState(showPackOpenStore)

    if(showPackOpen.size() === 0) return <Roact.Fragment/>

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
                {showPackOpen.map((card, i) => {
                    const cardData = getCardData(card.name)!;

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
                                Image={cardData.art}
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
                        setShowPackOpen([])
                    }
                }}
                TextTransparency={1}
                BackgroundTransparency={1}
                animate={{
                    TextTransparency: 0,
                    BackgroundTransparency: 0,
                    transition: {
                        delay: showPackOpen.size() * 0.5,
                    }
                }}
                Text="Close"
                Size={new UDim2(0, 100, 0, 50)}
                BackgroundColor3={theme.colours.secondary}
                BorderSizePixel={0}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                Font={Enum.Font.Jura}
                TextSize={20}
            />
        </frame>
    )
})