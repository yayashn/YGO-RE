import Roact from '@rbxts/roact'
import colours from 'shared/colours'

interface Props {
    text: string
    icon: string
    cost: number
    onClick: () => void
}

export default ({ text, icon, cost, onClick }: Props) => {
    return (
        <textbutton Text="" BorderSizePixel={5} BorderColor3={colours.outline}>
            <imagelabel
                BackgroundTransparency={1}
                Size={new UDim2(1, 0, 1, 0)}
                ScaleType="Crop"
                Image={icon}
            />
            <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
                <uilistlayout
                    FillDirection={Enum.FillDirection.Vertical}
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    VerticalAlignment={Enum.VerticalAlignment.Bottom}
                    Padding={new UDim(0, 10)}
                />
                <uipadding
                    PaddingBottom={new UDim(0, 10)}
                    PaddingLeft={new UDim(0, 10)}
                    PaddingRight={new UDim(0, 10)}
                />
                <frame Size={new UDim2(1, 0, 0.8, 0)} BackgroundTransparency={1}>
                    <textlabel
                        Text={text}
                        Size={new UDim2(1, 0, 0, 0)}
                        AutomaticSize="Y"
                        BackgroundColor3={Color3.fromRGB(0, 0, 0)}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextYAlignment="Top"
                        Font={Enum.Font.GothamBold}
                        TextSize={24}
                        TextStrokeColor3={Color3.fromRGB(0, 0, 0)}
                        TextTransparency={0}
                        TextWrap
                        Position={new UDim2(0, 0, 1, 0)}
                        AnchorPoint={new Vector2(0, 1)}
                    />
                </frame>
                <textbutton
                    Event={{
                        MouseButton1Click: onClick
                    }}
                    BackgroundColor3={colours.background}
                    BorderColor3={colours.outline}
                    BorderSizePixel={2}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextSize={16}
                    Size={new UDim2(0.33, 20, 0.2, 0)}
                    Text={`${cost} DP`}
                ></textbutton>
            </frame>
        </textbutton>
    )
}
