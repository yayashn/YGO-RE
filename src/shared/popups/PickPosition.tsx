import Roact from '@rbxts/roact'
import Flex from 'shared/components/Flex'
import Padding from 'shared/components/Padding'
import theme from 'shared/theme'
import { Position } from 'server/duel/types'

export default async (player: Player, art?: string) => {
    return new Promise<Position>((resolve) => {
        const prompt = Roact.mount(
            <screengui Key="Dialog" IgnoreGuiInset>
                <PickPosition 
                    art={art}
                    positions={{
                        FaceUpAttack: () => {
                            Roact.unmount(prompt)
                            resolve("FaceUpAttack")
                        },
                        FaceUpDefense: () => {
                            Roact.unmount(prompt)
                            resolve("FaceUpDefense")
                        }
                    }}  
                />
            </screengui>, 
            player.FindFirstChildWhichIsA("PlayerGui")
        )
    })
}

type PickPositionProps = {
    art?: string,
    positions: Record<string, Callback>,
}

export const PickPosition = ({ art = 'rbxassetid://3955072236', positions }: PickPositionProps) => {
    return (
        <textbutton 
            BackgroundTransparency={.5}
            BackgroundColor3={Color3.fromRGB(0, 0, 0)}
            Size={new UDim2(1, 0, 1, 0)}
            Position={new UDim2(0, 0, 0, 0)}
            AutoButtonColor={false}
            BorderSizePixel={0}
            Text={""}
        >
            <Flex flexDirection='column' justifyContent='center' alignItems='center'/>
            <frame
                BackgroundColor3={theme.colours.primary}
                Size={new UDim2(0, 400, 0, 200)}
                BackgroundTransparency={.2}
                BorderSizePixel={0}
                AutomaticSize={'Y'}
            >
                <Padding Padding={new UDim(0, 20)}/>
                <Flex flexDirection='column' justifyContent='center' alignItems='center'/>
                <frame 
                    BackgroundTransparency={1}
                    Size={new UDim2(1, 0, 0, 0)}
                    AutomaticSize={'Y'}
                    BackgroundColor3={theme.colours.secondary}
                >
                    <Flex gap={new UDim(0, 20)} justifyContent='center' alignItems='center'/>
                    <imagebutton
                    BackgroundTransparency={1}
                    Image={art}
                    Size={new UDim2(0, 200, 0, 200)}
                    Event={{
                        MouseButton1Click: () => {
                            positions["FaceUpAttack"]()
                        }
                    }}
                    >
                        <uiaspectratioconstraint AspectRatio={52.15/83}/>
                    </imagebutton>
                    <textbutton
                        Text=""
                        BackgroundTransparency={1}
                        Size={new UDim2(0, 200, 0, 200)}
                        Event={{
                            MouseButton1Click: () => {
                                positions["FaceUpDefense"]()
                            }
                        }}
                    >
                        <imagelabel
                        BackgroundTransparency={1}
                        Image={art}
                        AnchorPoint={new Vector2(0.5, 0.5)}
                        Position={new UDim2(0.5, 0, 0.5, 0)}
                        Rotation={90}
                        Size={new UDim2(0, 200, 0, 200)}
                        >
                            <uiaspectratioconstraint AspectRatio={52.15/83}/>
                        </imagelabel>
                    </textbutton>
                </frame>
            </frame>
        </textbutton>
    )
}