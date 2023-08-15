import Roact, { useRef, useState, useEffect } from '@rbxts/roact'
import { Players, TweenService } from '@rbxts/services'
import useSelectableZones from 'gui/hooks/useSelectableZones'
import type { Location } from 'server/duel/types'
import { PlayerRemotes } from 'shared/duel/remotes'

const player = Players.LocalPlayer

export default () => {
    const field = game.Workspace.Field3D.Field.Player.Field.Part
    const fieldOpponent = game.Workspace.Field3D.Field.Opponent.Field.Part

    return (
        <Roact.Fragment>
            {[field, fieldOpponent].map((f) => {
                return (
                    <surfacegui AlwaysOnTop Key="Field" Face="Top" Adornee={f}>
                        <uigridlayout
                            SortOrder="LayoutOrder"
                            CellPadding={new UDim2(0, 0, 0.005, 0)}
                            CellSize={new UDim2(0.2, -1, 0.5, 0)}
                        />
                        {[
                            'MZone1',
                            'MZone2',
                            'MZone3',
                            'MZone4',
                            'MZone5',
                            'SZone1',
                            'SZone2',
                            'SZone3',
                            'SZone4',
                            'SZone5'
                        ].map((zone, i) => {
                            return (
                                <FieldZoneButton
                                    playerType={f.Parent!.Parent!.Name as 'Player' | 'Opponent'}
                                    zoneName={zone}
                                    layoutOrder={i}
                                />
                            )
                        })}
                    </surfacegui>
                )
            })}
        </Roact.Fragment>
    )
}

interface FieldZoneButtonProps {
    zoneName: string
    layoutOrder: number
    animate?: boolean
    playerType: 'Player' | 'Opponent'
}

const pickZone = PlayerRemotes.Client.Get('pickZone')
const FieldZoneButton = ({ zoneName, layoutOrder, playerType }: FieldZoneButtonProps) => {
    const buttonRef = useRef<TextButton>()
    const [isHovered, setIsHovered] = useState(false)
    const [selectableZones, includesZone] = useSelectableZones()

    useEffect(() => {
        if (!buttonRef.current) return
        const button = buttonRef.current

        if (isHovered || includesZone(zoneName as Location, playerType)) {
            const tweenInfo = new TweenInfo(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, -1, true)
            TweenService.Create(button, tweenInfo, { BackgroundTransparency: 0.5 }).Play()
        } else {
            const tweenInfo = new TweenInfo(0.2, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
            TweenService.Create(button, tweenInfo, { BackgroundTransparency: 1 }).Play()
        }
    }, [isHovered, selectableZones])

    return (
        <textbutton
            BackgroundTransparency={1}
            Text=""
            BorderSizePixel={0}
            LayoutOrder={layoutOrder * (playerType === 'Player' ? -1 : 1)}
            key={zoneName}
            ref={buttonRef}
            AutoButtonColor={false}
            Event={{
                MouseButton1Click: () => {
                    pickZone.SendToServer(zoneName as Location, playerType.lower() as "player")
                },
                MouseEnter: () => {
                    if(includesZone(zoneName as Location, playerType)) return;
                    setIsHovered(true)
                },
                MouseLeave: () => {
                    setIsHovered(false)
                }
            }}
        />
    )
}
