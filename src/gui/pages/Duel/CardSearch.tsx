import Roact, { useEffect, useState } from '@rbxts/roact'
import { Players } from '@rbxts/services'
import useHoveredCard from 'gui/hooks/useHoveredCard'
import useIsTarget from 'gui/hooks/useIsTarget'
import useTargettableCards from 'gui/hooks/useTargettableCards'
import { CardPublic } from 'server/duel/types'
import Flex from 'shared/components/Flex'
import Padding from 'shared/components/Padding'
import { PlayerRemotes } from 'shared/duel/remotes'
import { atom, useAtom } from 'shared/jotai'
import theme from 'shared/theme'
import { includes } from 'shared/utils'

const handleCardClick = PlayerRemotes.Client.Get('handleCardClick')

export const shownCardsAtom = atom<CardPublic[] | false>(false)
const player = Players.LocalPlayer

export default () => {
    const [shownCards, setShownCards] = useAtom(shownCardsAtom);
    const targettableCards = useTargettableCards();

    const allCardsVisible = targettableCards.every((card) => {
        return ["MZone", "SZone", "FZone"].some((zone) => {
            return includes(card.location, zone);
        }) || (card.location === "Hand" && card.controller === player)
    });

    const shouldRenderModal = (targettableCards.size() > 0 && !allCardsVisible) || shownCards !== false;

    if (!shouldRenderModal) {
        return <Roact.Fragment />;
    }

    return (
        <screengui key="CardSearch" IgnoreGuiInset>
            <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
                <Flex flexDirection="column" justifyContent="center" alignItems="center" />
                <frame
                    Size={new UDim2(0, 400, 0, 200)}
                    BackgroundTransparency={0.2}
                    BorderSizePixel={0}
                    BackgroundColor3={theme.colours.primary}
                >
                    <Flex flexDirection="column" justifyContent="center" alignItems="center" />
                    {targettableCards.size() === 0 && (
                        <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0.2, 0)}>
                            <Flex flexDirection="row" justifyContent="end" alignItems="center" />
                            <Padding
                                PaddingBlock={new UDim(0, 10)}
                                PaddingInline={new UDim(0, 15)}
                            />
                            <textbutton
                                Event={{
                                    MouseButton1Click: () => {
                                        setShownCards(false);
                                    }
                                }}
                                BackgroundTransparency={1}
                                Size={new UDim2(1, 0, 1, 0)}
                                Text="×"
                                TextColor3={theme.colours.white}
                                TextSize={24}
                            >
                                <uiaspectratioconstraint AspectRatio={1} />
                            </textbutton>
                        </frame>
                    )}
                    <scrollingframe
                        BorderSizePixel={0}
                        ScrollBarThickness={2}
                        AutomaticCanvasSize={Enum.AutomaticSize.Y}
                        BackgroundTransparency={1}
                        Size={new UDim2(1, 0, targettableCards.size() > 0 ? 1 : 0.8, 0)}
                    >
                        <Padding
                            PaddingInline={new UDim(0, 20)}
                            PaddingBlock={(targettableCards.size() > 0) ? new UDim(0, 20) : new UDim(0, 0)}
                        />
                        <uigridlayout
                            CellPadding={new UDim2(0, 10, 0, 10)}
                            FillDirection={Enum.FillDirection.Horizontal}
                            CellSize={new UDim2(0, 52.15, 0, 83)}
                        />
                        {(targettableCards.size() > 0 ? targettableCards : shownCards as CardPublic[]).map((card) => {
                            return <Card card={card} />;
                        })}
                    </scrollingframe>
                </frame>
            </frame>
        </screengui>
    )
}

const Card = ({ card }: { card: CardPublic }) => {
    const targettableCards = useTargettableCards()
    const [shownCards] = useAtom(shownCardsAtom)
    const isTarget = useIsTarget(card)
    const [hoveredCard, setHoveredCard] = useHoveredCard()

    return (
        <imagebutton
            Image={card.art}
            BorderSizePixel={0}
            Size={new UDim2(0, 52.15, 0, 83)}
            Event={{
                MouseButton1Click: () => {
                    if (!targettableCards && shownCards) return
                    handleCardClick.CallServerAsync(card)
                },
                MouseEnter: () => {
                    setHoveredCard(card)
                }
            }}
        >
            <textlabel
                BackgroundTransparency={1}
                Size={new UDim2(1, 0, 1, -5)}
                TextYAlignment={Enum.TextYAlignment.Bottom}
                TextXAlignment={Enum.TextXAlignment.Center}
                Text={card.location}
                Font={Enum.Font.Jura}
                TextSize={14}
                TextColor3={theme.colours.white}
                TextStrokeColor3={theme.colours.white}
                TextStrokeTransparency={0}
            />
            {isTarget && <uistroke LineJoinMode="Miter" Color={Color3.fromRGB(0, 255, 0)} Thickness={2} />}
        </imagebutton>
    )
}