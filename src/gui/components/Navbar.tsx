import Roact, { useEffect } from '@rbxts/roact'
import Flex from '../../shared/components/Flex'
import theme from 'shared/theme'
import Padding from 'shared/components/Padding'
import usePlayerData from 'gui/hooks/usePlayerData'
import usePage from 'gui/hooks/usePage'
import waiting from 'shared/popups/waiting'
import { black } from 'shared/colours'

const player = script.FindFirstAncestorWhichIsA('Player')!
const cancelWaiting = waiting(`Loading data...`, player)

export default () => {
    const playerData = usePlayerData()
    const [page, setPage] = usePage()

    useEffect(() => {
        if (playerData === undefined) return
        cancelWaiting()
    }, [playerData])

    if (playerData === undefined) return <Roact.Fragment />

    return (
        <textbutton
            Event={{
                MouseButton1Click: () =>
                    setPage({
                        name: 'Decks'
                    })
            }}
            Text=""
            AutomaticSize={Enum.AutomaticSize.Y}
            BackgroundTransparency={1}
            Size={new UDim2(1, 0, 0, 0)}
        >
            <Flex flexDirection="column" alignItems="end" gap={new UDim(0, 10)} />
            <Padding PaddingRight={new UDim(0, 10)} PaddingTop={new UDim(0, 10)} />
            <frame
                BackgroundTransparency={0.2}
                BackgroundColor3={black}
                BorderSizePixel={0}
                Size={new UDim2(0, 100, 0, 100)}
            >
                <uicorner CornerRadius={new UDim(0, 5)} />
                <Flex justifyContent="center" alignItems="center" />
                <imagelabel
                    Image="rbxassetid://13064040206"
                    BackgroundTransparency={0}
                    BorderSizePixel={0}
                    Size={new UDim2(0.8, 0, 0.8, 0)}
                ></imagelabel>
            </frame>
            <textlabel
                BackgroundTransparency={0.2}
                Size={new UDim2(0, 100, 0, 20)}
                TextColor3={theme.colours.white}
                Font={Enum.Font.Jura}
                BackgroundColor3={black}
                TextScaled
                Text={`${playerData?.dp} DP`}
            >
                <uicorner CornerRadius={new UDim(0, 5)} />
                <Padding PaddingBlock={new UDim(0, 2)} />
            </textlabel>
        </textbutton>
    )
}
