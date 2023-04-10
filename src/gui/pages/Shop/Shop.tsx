import Roact from '@rbxts/roact'
import { useEffect, useState, withHooks } from '@rbxts/roact-hooked'
import { motion } from 'shared/motion'
import { createGlobalState, useGlobalState } from 'shared/useGlobalState'
import pageState from 'gui/store/pageState'
import colours from 'shared/colours'
import { Players } from '@rbxts/services'
import PackList from './PackList'
import { showPackOpenStore } from './Store'
import PackOpen from './PackOpen'

const variants = {
    open: {
        Size: new UDim2(0.8, 0, 0.8, 0),
        BackgroundTransparency: 0
    },
    closed: {
        Size: new UDim2(0, 0, 0, 0),
        BackgroundTransparency: 1
    }
}

const player = script.FindFirstAncestorWhichIsA('Player')
const DEV = Players.GetChildren().size() === 0

export default withHooks(() => {
    const [page, setPage] = useGlobalState(pageState)
    const [showPackOpen, setShowPackOpen] = useGlobalState(showPackOpenStore)

    return (
        <Roact.Fragment>
            <motion.frame
                Position={new UDim2(0.5, 0, 0.5, 0)}
                AnchorPoint={new Vector2(0.5, 0.5)}
                Size={new UDim2(0, 0, 0, 0)}
                variants={variants}
                animate={page === 'SHOP' ? 'open' : 'closed'}
                ClipsDescendants
                BorderSizePixel={2}
                BorderColor3={colours.outline}
                BackgroundColor3={colours.background}
                transition={{
                    duration: 0.25,
                    easingStyle: Enum.EasingStyle.Quad
                }}
            >
                <uiaspectratioconstraint AspectRatio={800 / 580} />
                <uisizeconstraint MaxSize={new Vector2(700, 500)} />
                <uilistlayout 
                    SortOrder={Enum.SortOrder.LayoutOrder}
                />
                <frame
                    Size={new UDim2(1, 0, 0.1, 0)}
                    BorderSizePixel={0}
                    BackgroundColor3={colours.outline}
                    LayoutOrder={0}
                >
                    <uisizeconstraint MaxSize={new Vector2(700, 50)} />
                    <textbutton
                        Text="×"
                        Size={new UDim2(0, 50, 1, 0)}
                        Position={new UDim2(1, 0, 0, 0)}
                        AnchorPoint={new Vector2(1, 0)}
                        BackgroundTransparency={1}
                        TextColor3={Color3.fromRGB(126, 0, 0)}
                        TextScaled
                        ZIndex={2}
                        Event={{
                            MouseButton1Click: () => {
                                setPage(undefined)
                            }
                        }}
                    >
                        <uiaspectratioconstraint AspectRatio={1} />
                    </textbutton>
                    <textbutton
                        Text="SHOP"
                        Size={new UDim2(1, 0, 0.6, 0)}
                        Position={new UDim2(0.5, 0, 0.5, 0)}
                        AnchorPoint={new Vector2(0.5, 0.5)}
                        BackgroundTransparency={1}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled
                        Font={Enum.Font.SourceSansBold}
                    />
                </frame>
                <PackList />
            </motion.frame>
            <PackOpen />
        </Roact.Fragment>
    )
})
