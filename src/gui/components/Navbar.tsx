import Roact from "@rbxts/roact";
import Flex from "./Flex";
import { motion } from "shared/motion";
import { useState, withHooks } from "@rbxts/roact-hooked";
import theme from "shared/theme";
import Padding from "./Padding";
import { useNavigate } from "gui/router";
import { useGlobalState } from "shared/useGlobalState";
import { playerDataStore } from "gui/hooks/useInitPlayerData";

export default withHooks(() => {
    const navigate = useNavigate()
    const [playerData, setPlayerData] = useGlobalState(playerDataStore)

    return (
        <frame
            AutomaticSize={Enum.AutomaticSize.Y}
            BackgroundTransparency={1}
            Size={new UDim2(1, 0, 0, 0)}>
            <Flex justifyContent="end" gap={new UDim(0, 10)} />
            <Padding PaddingRight={new UDim(0, 10)} PaddingTop={new UDim(0, 10)} />
            <frame
                BackgroundTransparency={1}
                AutomaticSize={Enum.AutomaticSize.XY}
            >
                <Flex flexDirection="column" alignItems="end" gap={new UDim(0, 10)} />
                <frame
                    BorderSizePixel={0}
                    BackgroundColor3={theme.colours.primary}
                    BackgroundTransparency={0.2}
                    AutomaticSize={Enum.AutomaticSize.X}
                    Size={new UDim2(0, 0, 0, 50)}>
                    
                    <Flex justifyContent="end" alignItems="center" gap={new UDim(0, 5)} />
                    <NavbarIconButton 
                    onClick={() => navigate("/decklist/")}
                    Image="rbxassetid://4943949493" />
                    <NavbarIconButton
                    onClick={() => navigate("/shop/")}
                    Image="rbxgameasset://Images/coin" />
                    <Padding PaddingInline={new UDim(0, 10)} />
                </frame>
                <frame
                    BorderSizePixel={0}
                    BackgroundColor3={theme.colours.primary}
                    BackgroundTransparency={0.2}
                    Size={new UDim2(0, 105, 0, 20)}>
                    
                    <Flex justifyContent="end" alignItems="center" gap={new UDim(0, 5)} />
                    <Padding PaddingInline={new UDim(0, 10)} />
                    <textlabel
                        BackgroundTransparency={1}
                        Size={new UDim2(1, 0, 0, 20)}
                        TextColor3={theme.colours.white}
                        Font={Enum.Font.Jura}
                        TextScaled
                        Text={`${playerData?.dp} DP`} >
                            <Padding PaddingBlock={new UDim(0, 2)} />
                        </textlabel>
                </frame>
            </frame>

            <frame
                BackgroundTransparency={0.2}
                BackgroundColor3={theme.colours.primary}
                BorderSizePixel={0}
                Size={new UDim2(0, 100, 0, 100)}>
                <Flex justifyContent="center" alignItems="center" />
                
                <imagelabel
                    Image="rbxassetid://13064040206"
                    BackgroundTransparency={0}
                    BorderSizePixel={0}
                    Size={new UDim2(0.8, 0, 0.8, 0)} >
                    <uicorner CornerRadius={new UDim(0, 2.5)} />
                </imagelabel>
            </frame>
        </frame>
    )
})

interface NavbarIconButtonProps {
    Image: string
    onClick?: Callback
}

const NavbarIconButton = withHooks((props: NavbarIconButtonProps) => {
    const [hovered, setHovered] = useState(false)

    const variants = {
        hovered: {
            Scale: 1.2
        },
        unhovered: {
            Scale: 1
        }
    }

    return (
        <textbutton
            Size={new UDim2(0, 40, 0, 40)}
            BackgroundTransparency={1} Text="">
            <imagebutton
                Event={{
                    MouseEnter: () => setHovered(true),
                    MouseLeave: () => setHovered(false),
                    MouseButton1Click: props.onClick
                }}
                Image={props.Image}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundTransparency={1}
                Size={new UDim2(0, 30, 0, 30)}>
                <motion.uiscale
                    transition={{
                        duration: 0.1
                    }}
                    animate={hovered ? "hovered" : "unhovered"}
                    variants={variants} />
            </imagebutton>
        </textbutton>
    )
})