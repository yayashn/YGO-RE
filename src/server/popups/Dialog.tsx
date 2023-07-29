import Roact from '@rbxts/roact'
import { useRef, useState, withHooks } from '@rbxts/roact-hooked'
import theme from 'shared/theme'
import TextboxServer from './TextboxServer'

export interface DialogOption {
    text: string
    MouseButton1Click: () => void
}

export interface DialogProps {
    message: string;
    options?: DialogOption[];
    handleInput?: (input: string) => void;
    player?: Player;
}

export default withHooks<DialogProps>(({ message, options, handleInput, player }) => {
    const [input, setInput] = useState<string>('')
    const inputRef = useRef<TextBox>()
    const hasButtons = options && options.size() > 0

    return (
        <frame {...Container}>
            <frame {...PromptContainer}>
                <uipadding
                    PaddingTop={new UDim(0, 10)}
                    PaddingBottom={new UDim(0, 10)}
                    PaddingLeft={new UDim(0, 10)}
                    PaddingRight={new UDim(0, 10)}
                />
                <uilistlayout
                    Padding={new UDim(0, 10)}
                    FillDirection="Vertical"
                    HorizontalAlignment="Center"
                    VerticalAlignment="Center"
                />
                <uisizeconstraint MaxSize={new Vector2(450, 9999)} />

                {!player && <textlabel {...MessageStyle} Text={message}/>}
                {player && <textbox Ref={inputRef}
                {...InputStyle} PlaceholderText={message} Text={input}>
                    <TextboxServer setTextboxState={setInput}/>    
                </textbox>}

                {hasButtons && (
                    <frame Size={new UDim2(1, 0, 0, 40)} BackgroundTransparency={1}>
                        <uipadding PaddingTop={new UDim(0, 10)} />
                        <uilistlayout
                            VerticalAlignment="Bottom"
                            FillDirection="Horizontal"
                            HorizontalAlignment="Center"
                            Padding={new UDim(0, 10)}
                        />
                        {!player && options.map((option, index) => (
                            <textbutton
                                {...ButtonStyle}
                                Text={option.text}
                                Key={index}
                                Event={{
                                    MouseButton1Click: option.MouseButton1Click
                                }}
                            >
                                <uipadding {...ButtonPadding} />
                            </textbutton>
                        ))}
                        {player && options.map((option, index) => (
                            <textbutton
                                {...ButtonStyle}
                                Text={option.text}
                                Key={index}
                                Event={{
                                    MouseButton1Click: () => {
                                        if (option.text.lower() === "submit" && handleInput) {
                                            handleInput(input);
                                        }
                                        option.MouseButton1Click();
                                    },
                                }}
                            >
                                <uipadding {...ButtonPadding} />
                            </textbutton>
                        ))}
                    </frame>
                )}
            </frame>
        </frame>
    )
})

const Container: JSX.IntrinsicElement<Frame> = {
    BackgroundTransparency: 1,
    BackgroundColor3: Color3.fromRGB(0, 0, 0),
    Size: new UDim2(1, 0, 1, 0),
    Position: new UDim2(0, 0, 0, 0),
    BorderSizePixel: 0,
}

const PromptContainer: JSX.IntrinsicElement<Frame> = {
    BackgroundColor3: theme.colours.primary,
    BorderColor3: new Color3(26 / 255, 101 / 255, 110 / 255),
    BackgroundTransparency: 0.2,
    Size: new UDim2(1, 0, 0, 0),
    AutomaticSize: 'Y',
    Position: new UDim2(0.5, 0, 0.5, 0),
    AnchorPoint: new Vector2(0.5, 0.5),
    BorderSizePixel: 0
}

const MessageStyle: JSX.IntrinsicElement<TextLabel> = {
    Size: new UDim2(0.9, 0, 0, 40),
    TextColor3: Color3.fromRGB(255, 255, 255),
    BackgroundTransparency: 1,
    TextXAlignment: 'Center',
    TextYAlignment: 'Center',
    TextSize: 16,
    TextWrapped: true,
    AutomaticSize: 'Y'
}

const InputStyle: JSX.IntrinsicElement<TextBox> = {
    Size: new UDim2(0.9, 0, 0, 40),
    BackgroundColor3: theme.colours.secondary,
    BorderSizePixel: 0,
    BorderColor3: new Color3(26 / 255, 101 / 255, 110 / 255),
    TextXAlignment: 'Center',
    TextYAlignment: 'Center',
    TextSize: 16,
    TextWrapped: true,
    AutomaticSize: 'Y',
    Font: Enum.Font.Jura
}

const ButtonStyle: JSX.IntrinsicElement<TextButton> = {
    BackgroundColor3: theme.colours.secondary,
    BorderSizePixel: 0,
    BorderColor3: new Color3(26 / 255, 101 / 255, 110 / 255),
    Size: new UDim2(0, 100, 0, 40),
    TextScaled: true,
    Font: Enum.Font.Jura
}
const ButtonPadding: JSX.IntrinsicElement<UIPadding> = {
    PaddingTop: new UDim(0, 10),
    PaddingBottom: new UDim(0, 10),
    PaddingLeft: new UDim(0, 10),
    PaddingRight: new UDim(0, 10)
}