import Roact, { useRef, useState } from '@rbxts/roact'
import theme from 'shared/theme'
import TextboxServer from './TextboxServer'
import { black, white } from 'shared/colours'
import Flex from 'shared/components/Flex'

export interface DialogOption {
    text: string
    MouseButton1Click: () => void
}

export interface DialogProps {
    message: string
    options?: DialogOption[]
    handleInput?: (input: string) => void
    player?: Player
}

export default ({ message, options, handleInput, player }: DialogProps) => {
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
                    Padding={new UDim(0, 20)}
                    FillDirection="Vertical"
                    HorizontalAlignment="Center"
                    VerticalAlignment="Center"
                />
                <uicorner CornerRadius={new UDim(0, 10)} />
                <uisizeconstraint MaxSize={new Vector2(450, 9999)} />

                {!player && <textlabel {...MessageStyle} Text={message} />}
                {player && (
                    <textbox ref={inputRef} {...InputStyle} PlaceholderText={message} Text={input}>
                        <TextboxServer setTextboxState={setInput} />
                    </textbox>
                )}

                {hasButtons && (
                    <frame Size={new UDim2(1, 0, 0, 40)} BackgroundTransparency={1}>
                        <uipadding PaddingTop={new UDim(0, 10)} />
                        <uilistlayout
                            VerticalAlignment="Bottom"
                            FillDirection="Horizontal"
                            HorizontalAlignment="Center"
                            Padding={new UDim(0, 10)}
                        />
                        {!player &&
                            options.map((option, index) => (
                                <Button
                                    width={new UDim(options.size() > 1 ? .9/options.size() : 0, options.size() > 1 ? 0 : 260)}
                                    text={option.text}
                                    onClick={() => {
                                        if (option.text.lower() === 'submit' && handleInput) {
                                            handleInput(input)
                                        }
                                        option.MouseButton1Click()
                                    }}
                                />
                            ))}
                    </frame>
                )}
            </frame>
        </frame>
    )
}

const Button = ({ width = new UDim(0, 260), onClick, text }: { text: string; onClick: Callback, width: UDim }) => {
    const [hovered, setHovered] = useState(false)

    return (
        <imagebutton
            Size={new UDim2(width.Scale, width.Offset, 0, 48)}
            BackgroundColor3={white}
            BackgroundTransparency={hovered ? 0.8 : 1}
            AutoButtonColor={false}
            Event={{
                MouseEnter: () => setHovered(true),
                MouseLeave: () => setHovered(false),
                MouseButton1Click: () => onClick()
            }}
        >
            <Flex justifyContent="center" alignItems="center" />
            <uistroke Color={white} Transparency={0.3} Thickness={1} />
            <uicorner CornerRadius={new UDim(0, 8)} />
            <textlabel
                Text={text}
                Font={Enum.Font.GothamMedium}
                TextColor3={white}
                TextSize={18}
                Size={new UDim2(0, 100, 0, 40)}
                BackgroundTransparency={1}
            />
        </imagebutton>
    )
}

const Container: JSX.IntrinsicElement<Frame> = {
    BackgroundTransparency: 1,
    BackgroundColor3: Color3.fromRGB(0, 0, 0),
    Size: new UDim2(1, 0, 1, 0),
    Position: new UDim2(0, 0, 0, 0),
    BorderSizePixel: 0
}

const PromptContainer: JSX.IntrinsicElement<Frame> = {
    BackgroundColor3: black,
    BorderColor3: white,
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
    BackgroundColor3: black,
    BackgroundTransparency: 1,
    BorderSizePixel: 0,
    BorderColor3: white,
    TextColor3: white,
    TextXAlignment: 'Center',
    TextYAlignment: 'Center',
    TextSize: 16,
    TextWrapped: true,
    AutomaticSize: 'Y',
    Font: Enum.Font.GothamMedium
}