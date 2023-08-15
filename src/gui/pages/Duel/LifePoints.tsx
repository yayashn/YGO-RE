import Roact from '@rbxts/roact'
import { Players } from '@rbxts/services'
import useLP from 'gui/hooks/useLP'
import { black } from 'shared/colours'
import Flex from 'shared/components/Flex'
import Padding from 'shared/components/Padding'

const player = Players.LocalPlayer

export default function LifePoints() {
    const { playerLP, opponentLP } = useLP()

    return (
        <screengui key="LifePoints" IgnoreGuiInset>
            <Padding Padding={new UDim(0, 10)} />
            <frame
                BackgroundTransparency={1}
                AutomaticSize={Enum.AutomaticSize.Y}
                Size={new UDim2(1, 0, 0, 0)}
            >
                <Flex flexDirection="column" alignItems="end" gap={new UDim(0, 20)} />
                <PlayerLp name="Opponent" lp={opponentLP} />
                <PlayerLp name="You" lp={playerLP} />
            </frame>
        </screengui>
    )
}

interface PlayerLpProps {
    lp: number
    name: string
}

const PlayerLp = ({ lp, name }: PlayerLpProps) => {
    const isOpponent = name !== 'You' && name !== player.Name

    return (
        <textlabel
            BackgroundColor3={black}
            BackgroundTransparency={0.2}
            TextColor3={isOpponent ? Color3.fromRGB(254, 17, 14) : Color3.fromRGB(0, 128, 255)}
            Size={new UDim2(0, 140, 0, 40)}
            Text={`${lp}`}
            TextSize={20}
            BorderSizePixel={0}
            Font={Enum.Font.Jura}
        >
            <uicorner CornerRadius={new UDim(0, 5)} />
        </textlabel>
    )
}
