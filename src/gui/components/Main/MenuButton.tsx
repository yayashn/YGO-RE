import { motion } from "shared/motion"
import Roact from "@rbxts/roact"
import { withHooks, useState } from "@rbxts/roact-hooked"
import colours from "shared/colours"

interface MenuButtonProps {
    icon: string,
    text: string,
    onClick?: Callback,
}
export default withHooks(({
    icon,
    text,
    onClick,
}: MenuButtonProps) => {
    const [hovered, setHovered] = useState(false)

    const variants = {
        hovered: {
            Size: new UDim2(0, 40, 0, 40),
        },
        unhovered: {
            Size: new UDim2(0, 30, 0, 30),
        }
    }

    const labelVariants = {
        hovered: {
            Size: new UDim2(0, 100, 0, 20),
            BackgroundTransparency: 0,
            TextTransparency: 0,
            TextStrokeTransparency: 0,
        },
        unhovered: {
            Size: new UDim2(0, 0, 0, 0),
            BackgroundTransparency: 1,
            TextTransparency: 1,
            TextStrokeTransparency: 1,
        }
    }

    return (
        <frame
        Size={new UDim2(0, 37, 1, 0)} BackgroundTransparency={1}>
            <uipadding
                PaddingRight={new UDim(0, 2)}
                PaddingLeft={new UDim(0, 2)}
                PaddingBottom={new UDim(0, 2)}
                PaddingTop={new UDim(0, 2)}
            />
            <motion.imagebutton
                Event={{
                    MouseEnter: () => setHovered(true),
                    MouseLeave: () => setHovered(false),
                    MouseButton1Click: onClick,
                }}
                Size={new UDim2(0, 37, 1, 0)}
                AnchorPoint={new Vector2(.5,.5)}
                Position={new UDim2(0.5,0,0.5,0)}
                BackgroundTransparency={1}
                Image={icon}
                variants={variants}
                animate={hovered ? "hovered" : "unhovered"}
                transition={{
                    duration: 0.15,
                }}
            >
            </motion.imagebutton>
            <motion.textlabel
                TextSize={14}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                BackgroundColor3={Color3.fromRGB(0, 0, 0)}
                BorderColor3={colours.outline}
                Text={text}
                BorderSizePixel={0}
                Font={Enum.Font.GothamBlack}
                variants={labelVariants}
                animate={hovered ? "hovered" : "unhovered"}
                transition={{
                    duration: 0.15,
                }}
                Size={new UDim2(0, 0, 0, 0)}
                BackgroundTransparency={1}
                TextTransparency={1}
                Position={new UDim2(.5, 0, 0, 50)}
                AnchorPoint={new Vector2(.5, .5)}>
            </motion.textlabel>
        </frame>
    )
})
