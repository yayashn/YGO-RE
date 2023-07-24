import { Location, Position } from 'server/duel/types';
import Remotes from 'shared/net'
import { get3DZone } from 'shared/utils'

Remotes.Client.OnEvent('moveCard3D', (card2D, location, isOpponent) => {
    const card3D = (card2D.FindFirstChild('card3D') as ObjectValue).Value!;
    card3D.Parent = get3DZone(location, isOpponent)
})

const tweenService = game.GetService('TweenService')
const tweenInfo = new TweenInfo(0.25, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0)

const field = game.Workspace.Field3D.Field

const positionOrientation = {
    Player: {
        FaceUpAttack: CFrame.Angles(0, math.rad(-90), math.rad(180)),
        FaceUpDefense: CFrame.Angles(0, math.rad(-180), math.rad(180)),
        FaceUp: CFrame.Angles(0, math.rad(-90), math.rad(180)),
        FaceDown: CFrame.Angles(0, math.rad(90), math.rad(0)),
        FaceDownDefense: CFrame.Angles(0, math.rad(180), math.rad(0))
    },
    Opponent: {
        FaceUpAttack: CFrame.Angles(0, math.rad(90), math.rad(180)),
        FaceUpDefense: CFrame.Angles(0, math.rad(180), math.rad(180)),
        FaceUp: CFrame.Angles(0, math.rad(90), math.rad(180)),
        FaceDown: CFrame.Angles(0, math.rad(-90), math.rad(0)),
        FaceDownDefense: CFrame.Angles(0, math.rad(0), math.rad(0))
    }
}

const zoneOrientation = {
    Player: {
        FaceUp: new Vector3(0, -90, -180),
        FaceDown: new Vector3(0, -90, 0),
        FaceUpAttack: new Vector3(0, -90, -180),
        FaceUpDefense: new Vector3(0, -90, -180),
        FaceDownDefense: new Vector3(0, -90, 0)
    },
    Opponent: {
        FaceUp: new Vector3(0, 90, -180),
        FaceDown: new Vector3(0, 90, 0),
        FaceUpAttack: new Vector3(0, 90, -180),
        FaceUpDefense: new Vector3(0, 90, -180),
        FaceDownDefense: new Vector3(0, 90, 0)
    }
}

;[field.Player, field.Opponent].forEach((playerField) => {
    // Stackable zone animations
    ;['GZone', 'BZone', 'EZone', 'Deck', 'FZone'].forEach((zoneName) => {
        const zone = playerField[zoneName as keyof typeof playerField] as Vector3Value
        const position = zone.Value

        const stackCards = () => {
            zone.GetChildren().forEach((card3D) => {
                const cardButton = ((card3D as Part).WaitForChild('card2D') as ObjectValue)
                    .Value as unknown as SurfaceGui
                const order = (
                    (cardButton as unknown as Instance).WaitForChild('getOrder') as RemoteFunction
                ).InvokeServer() as number
                const pos = (
                    (cardButton as unknown as Instance).WaitForChild(
                        'getPosition'
                    ) as RemoteFunction
                ).InvokeServer() as Position
                const location = (
                    (cardButton as unknown as Instance).WaitForChild(
                        'getLocation'
                    ) as RemoteFunction
                ).InvokeServer() as Location
                const tweenGoal = {
                    Position: new Vector3(position.X, position.Y + order * 0.5, position.Z),
                } as Partial<ExtractMembers<Instance, Tweenable>>
                const tween = tweenService.Create(card3D, tweenInfo, tweenGoal)
                Promise.defer(() => {
                    if (location === zoneName) {
                        (card3D as Part).Orientation = zoneOrientation[playerField.Name as "Player" | "Opponent"][pos]
                        tween.Play()
                    }
                })
            })
        }

        zone.ChildAdded.Connect(stackCards)
        zone.ChildRemoved.Connect(stackCards)
    })

    // Hand animations
    const center = playerField.Hand.Center.Position
    const orientation = playerField.Hand.Center.Orientation
    const margin = playerField === field.Player ? 20 : 10
    const layoutCards = (child: Instance) => {
        const parentSize = playerField.Hand.Center.Size
        const childSize = (child as Part).Size

        let totalWidth = 0
        const handCards = playerField.Hand.GetChildren().filter(
            (card3D) => card3D.Name === 'Card'
        ) as Part[]

        handCards.forEach((card3D) => {
            totalWidth += card3D.Size.X - margin
        })

        let currentX = parentSize.X / 2 - totalWidth / 2

        handCards.forEach((card3D, index) => {
            // Subtract center's X value from the desired X position
            const tweenGoal = {
                Position: new Vector3(
                    currentX +
                        index * (childSize.X - margin) +
                        (playerField === field.Player ? center.X / 2 : center.X),
                    center.Y,
                    center.Z
                )
            }
            ;card3D.Orientation = orientation
            tweenService.Create(card3D, tweenInfo, tweenGoal).Play()
        })
    }
    playerField.Hand.ChildAdded.Connect(layoutCards)
    playerField.Hand.ChildRemoved.Connect(layoutCards)

    // Field zone animations
    const animateZone = (card3D: Part, zone: Vector3Value) => {
        const card2D = (card3D.FindFirstChild("card2D") as ObjectValue).Value!;
        const position = (card2D.FindFirstChild("getPosition") as RemoteFunction).InvokeServer() as Position
        let tweenGoal: { CFrame: CFrame } = { CFrame: new CFrame() }

        tweenGoal.CFrame = positionOrientation[playerField.Name as 'Player' | 'Opponent'][
            position
        ].add(zone.Value)

        tweenService
            .Create(card3D, tweenInfo, tweenGoal as Partial<ExtractMembers<Instance, Tweenable>>)
            .Play()
    }

    playerField.Field.GetChildren()
        .filter((zone) => zone.IsA('Vector3Value'))
        .forEach((zone) => {
            const connections: Record<string, RBXScriptConnection> = {}
            zone.ChildAdded.Connect((card3D) => {
                animateZone(card3D as Part, zone as Vector3Value)

                const card2D = ((card3D as Part).FindFirstChild("card2D") as ObjectValue).Value!;
                connections[(card2D.FindFirstChild("getUid") as RemoteFunction).InvokeServer() as string] =
                    (card2D.FindFirstChild("positionChanged") as RemoteEvent).OnClientEvent.Connect(() => {
                        if ((card2D.FindFirstChild("getLocation") as RemoteFunction).InvokeServer() === zone.Name) {
                            animateZone(card3D as Part, zone as Vector3Value)
                        }
                    })
            })
            zone.ChildRemoved.Connect((card3D) => {
                const card2D = (card3D.FindFirstChild("card2D") as ObjectValue).Value!;
                connections[(card2D.FindFirstChild("getUid") as RemoteFunction).InvokeServer() as string].Disconnect()
            })
        })
})