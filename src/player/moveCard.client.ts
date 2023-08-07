import type{ CardPublic, Position } from 'server/duel/types'
import debounce from 'shared/debounce'
import Remotes from 'shared/net/remotes'
import { get3DZone } from 'shared/utils'

Remotes.Client.OnEvent('moveCard3D', async (card2D, location, isOpponent) => {
    const card3D = (card2D.FindFirstChild('card3D') as ObjectValue).Value!
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
    ;['GZone', 'BZone', 'EZone', 'Deck', 'FZone'].forEach((zoneName) => {
        const zone = playerField[zoneName as keyof typeof playerField] as Part
        const position = zone.Position

        const stackCards = debounce(async () => {
            const card3Ds = zone.GetChildren()

            const promises = card3Ds.map((card3D) => {
                return new Promise(async (resolve) => {
                    const card2D = card3D.WaitForChild('card2D') as ObjectValue
                    while (!card2D.Value) {
                        await Promise.delay(0)
                    }
                    while (card2D.Value.FindFirstChild('getCard') === undefined) {
                        await Promise.delay(0)
                    }
                    const cardButton = card2D.Value as SurfaceGui

                    const { order, position: pos, location } = (cardButton.FindFirstChild("getCard") as BindableFunction).Invoke() as CardPublic
                    const typedOrder = order as number
                    const typedPos = pos as keyof (typeof zoneOrientation)['Player']
                    const typedLocation = location as string

                    const tweenGoal = {
                        Position: new Vector3(position.X, position.Y + typedOrder * 0.5, position.Z)
                    } as Partial<ExtractMembers<Instance, Tweenable>>

                    const tween = tweenService.Create(card3D, tweenInfo, tweenGoal)
                    if (typedLocation === zoneName) {
                        ;(card3D as Part).Orientation =
                            zoneOrientation[playerField.Name as 'Player' | 'Opponent'][typedPos]
                        tween.Play()
                    }

                    resolve('')
                })
            })
            await Promise.all(promises)
        }, 100)

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
            card3D.Orientation = orientation
            tweenService.Create(card3D, tweenInfo, tweenGoal).Play()
        })
    }
    playerField.Hand.ChildAdded.Connect(layoutCards)
    playerField.Hand.ChildRemoved.Connect(layoutCards)

    // Field zone animations
    const animateZone = (card3D: Part, zone: Vector3Value) => {
        const card2D = ((card3D as Part).FindFirstChild('card2D') as ObjectValue).Value!
        const { position } = (card2D.WaitForChild('getCard') as BindableFunction).Invoke() as {
            position: keyof typeof positionOrientation.Player
        }
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

            zone.ChildAdded.Connect(async (card3D) => {
                animateZone(card3D as Part, zone as Vector3Value)

                const card2D = ((card3D as Part).FindFirstChild('card2D') as ObjectValue).Value!

                const { uid, location } = (
                    card2D.WaitForChild('getCard') as BindableFunction
                ).Invoke() as {
                    uid: string
                    location: string
                }

                connections[uid] = (
                    card2D.FindFirstChild('positionChanged') as BindableEvent
                ).Event.Connect(() => {
                    if (location === zone.Name) {
                        animateZone(card3D as Part, zone as Vector3Value)
                    }
                })
            })
            zone.ChildRemoved.Connect(async (card3D) => {
                const card2D = (card3D.FindFirstChild('card2D') as ObjectValue).Value!

                const { uid } = (card2D.WaitForChild('getCard') as BindableFunction).Invoke() as {
                    uid: string
                }

                connections[uid].Disconnect()
            })
        })

    //Fzone
    const animateZonePart = (card3D: Part, zone: Part) => {
        const card2D = (card3D.FindFirstChild('card2D') as ObjectValue).Value!
        const { position } = (card2D.WaitForChild('getCard') as BindableFunction).Invoke() as {
            position: Position
        }
        let tweenGoal: { CFrame: CFrame } = { CFrame: new CFrame() }

        tweenGoal.CFrame = positionOrientation[playerField.Name as 'Player' | 'Opponent'][
            position
        ].add(zone.Position)

        tweenService
            .Create(card3D, tweenInfo, tweenGoal as Partial<ExtractMembers<Instance, Tweenable>>)
            .Play()
    }

    const connections: Record<string, RBXScriptConnection> = {}

    playerField.FZone.ChildAdded.Connect(async (card3D) => {
        animateZonePart(card3D as Part, playerField.FZone)

        const card2D = ((card3D as Part).FindFirstChild('card2D') as ObjectValue).Value!

        const { uid } = (card2D.WaitForChild('getCard') as BindableFunction).Invoke() as {
            uid: string
            location: string
        }

        connections[uid] = (
            card2D.FindFirstChild('positionChanged') as BindableEvent
        ).Event.Connect(() => {
            const { location } = (card2D.WaitForChild('getCard') as BindableFunction).Invoke() as {
                location: string
            }
            if (location === playerField.FZone.Name) {
                animateZonePart(card3D as Part, playerField.FZone)
            }
        })
    })
    playerField.FZone.ChildRemoved.Connect(async (card3D) => {
        const card2D = (card3D.FindFirstChild('card2D') as ObjectValue).Value!

        const { uid } = (card2D.WaitForChild('getCard') as BindableFunction).Invoke() as {
            uid: string
        }

        connections[uid].Disconnect()
    })
})
