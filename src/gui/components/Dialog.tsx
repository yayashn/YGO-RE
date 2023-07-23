import Roact from '@rbxts/roact'
import { useEffect, useRef, useState, withHooks } from '@rbxts/roact-hooked'
import { ReplicatedStorage, ServerStorage } from '@rbxts/services'
import theme from 'shared/theme'

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

const cardSearchInput = ReplicatedStorage.FindFirstChild('remotes')!.FindFirstChild(
    'cardSearchInput'
) as RemoteEvent
const cardSearchScript = ServerStorage.FindFirstChild('cardSearch') as LocalScript

export default withHooks<DialogProps>(({ message, options, handleInput, player }) => {
    const [input, setInput] = useState<string>('')
    const inputRef = useRef<TextBox>()
    const hasButtons = options && options.size() > 0

    useEffect(() => {
        if (inputRef.getValue()) {
            const cardSearchScriptClone = cardSearchScript.Clone()
            cardSearchScriptClone.Parent = inputRef.getValue()
            const connection = cardSearchInput.OnServerEvent.Connect((p, text) => {
                if (p !== player) return
                setInput(text as string)
            })

            return () => {
                cardSearchScriptClone.Destroy()
                connection.Disconnect()
            }
        }
    }, [inputRef])

    return (
        <textbutton {...Container}>
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
                {...InputStyle} PlaceholderText={message} Text={input}/>}

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
        </textbutton>
    )
})

const Container: JSX.IntrinsicElement<TextButton> = {
    BackgroundTransparency: .5,
    BackgroundColor3: Color3.fromRGB(0, 0, 0),
    Size: new UDim2(1, 0, 1, 0),
    Position: new UDim2(0, 0, 0, 0),
    AutoButtonColor: false,
    BorderSizePixel: 0,
    Text: ""
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