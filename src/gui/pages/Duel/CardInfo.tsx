import Roact, { useEffect } from '@rbxts/roact'
import { RunService } from '@rbxts/services'
import useHoveredCard from 'gui/hooks/useHoveredCard'
import Flex from 'shared/components/Flex'
import Padding from 'shared/components/Padding'
import theme from 'shared/theme'

export default () => {
    const [hoveredCard] = useHoveredCard()

    return (
        <screengui 
        key="CardInfo"
        IgnoreGuiInset>
            <frame
                key="CardInfo"
                BackgroundTransparency={0.2}
                BackgroundColor3={new Color3(0, 0, 0)}
                Size={new UDim2(0.25, 0, 1, 0)}
                BorderSizePixel={0}
            >
                <Flex flexDirection="column" />
                <uisizeconstraint MaxSize={new Vector2(270, math.huge)} />
                <imagelabel
                    Image={(hoveredCard && hoveredCard.art) ? hoveredCard.art : 'rbxassetid://3955072236'}
                    BorderSizePixel={0}
                    Size={new UDim2(1, 0, 0.5, 0)}
                >
                    <uiaspectratioconstraint AspectRatio={421/614} />
                    <Padding PaddingBottom={new UDim(0, 3)} />
                </imagelabel>
                {(hoveredCard && hoveredCard.art) !== undefined && (
                    <Roact.Fragment>
                        <textlabel
                            Size={new UDim2(1, 0, 0, 0)}
                            TextSize={20}
                            AutomaticSize={Enum.AutomaticSize.Y}
                            TextColor3={theme.colours.white}
                            Text={hoveredCard?.name}
                            TextXAlignment={'Left'}
                            BackgroundTransparency={1}
                            Font={Enum.Font.Jura}
                            TextStrokeColor3={theme.colours.white}
                            TextStrokeTransparency={0}
                        >
                            <Padding
                                PaddingInline={new UDim(0, 10)}
                                PaddingBlock={new UDim(0, 3)}
                            />
                        </textlabel>
                        <textlabel
                            Size={new UDim2(1, 0, 0, 0)}
                            TextSize={14}
                            AutomaticSize={Enum.AutomaticSize.Y}
                            TextColor3={theme.colours.white}
                            TextWrap
                            Text={`[${hoveredCard?.type}] ${
                                hoveredCard?.race
                            }/${hoveredCard?.attribute?.upper()}${
                                hoveredCard?.level ? '/' + hoveredCard.level + '★' : ''
                            }`}
                            TextXAlignment={'Left'}
                            BackgroundTransparency={1}
                            Font={Enum.Font.Jura}
                        >
                            <Padding
                                PaddingInline={new UDim(0, 10)}
                                PaddingBlock={new UDim(0, 3)}
                            />
                        </textlabel>
                        {hoveredCard?.atk !== undefined && (
                            <textlabel
                                Size={new UDim2(1, 0, 0, 0)}
                                TextSize={14}
                                AutomaticSize={Enum.AutomaticSize.Y}
                                TextColor3={theme.colours.white}
                                Text={`${hoveredCard.atk}/${hoveredCard.def}`}
                                TextXAlignment={'Left'}
                                BackgroundTransparency={1}
                                Font={Enum.Font.Jura}
                            >
                                <Padding
                                    PaddingInline={new UDim(0, 10)}
                                    PaddingBlock={new UDim(0, 3)}
                                />
                            </textlabel>
                        )}
                        <textlabel
                            Size={new UDim2(1, 0, 0, 0)}
                            TextSize={14}
                            AutomaticSize={Enum.AutomaticSize.Y}
                            TextColor3={theme.colours.white}
                            Text={hoveredCard?.desc}
                            TextXAlignment={'Left'}
                            BackgroundTransparency={1}
                            Font={Enum.Font.Jura}
                            TextWrap
                            TextYAlignment={'Top'}
                        >
                            <Padding
                                PaddingInline={new UDim(0, 10)}
                                PaddingBlock={new UDim(0, 3)}
                            />
                        </textlabel>
                    </Roact.Fragment>
                )}
            </frame>
        </screengui>
    )
}
