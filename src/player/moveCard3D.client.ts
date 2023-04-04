import { get3DZone } from 'shared/utils'
import { Card3D } from './createCard3D.client'
import type { Position } from 'server/types'
import { CardButton } from 'gui/duel/Cards/Cards'
import { Location } from 'shared/types'

const replicatedStorage = game.GetService('ReplicatedStorage')
const moveCard3D = replicatedStorage.FindFirstChild('moveCard3D.re', true) as RemoteEvent

moveCard3D.OnClientEvent.Connect(
    (cardButton: CardButton & ImageButton, location: Location, isOpponent?: boolean) => {
        const card3D = (cardButton.FindFirstChild('card3D') as ObjectValue).Value!
        card3D.Parent = get3DZone(location, isOpponent)
    }
)

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
    ;['GZone', 'BZone', 'EZone', 'Deck'].forEach((zoneName) => {
        const zone = playerField[zoneName as keyof typeof playerField] as Vector3Value
        const position = zone.Value

        const stackCards = () => {
            zone.GetChildren().forEach((card3D) => {
                const cardButton = ((card3D as Card3D).WaitForChild('card2D') as ObjectValue)
                    .Value as unknown as CardButton
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
                    Orientation: zoneOrientation[playerField.Name as "Player" | "Opponent"][pos]
                } as Partial<ExtractMembers<Instance, Tweenable>>
                const tween = tweenService.Create(card3D, tweenInfo, tweenGoal)
                Promise.defer(() => {
                    if (location === zoneName) {
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
        const childSize = (child as Card3D).Size

        let totalWidth = 0
        const handCards = playerField.Hand.GetChildren().filter(
            (card3D) => card3D.Name === 'Card'
        ) as Card3D[]

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
            ;(card3D as Card3D).Orientation = orientation
            tweenService.Create(card3D, tweenInfo, tweenGoal).Play()
        })
    }
    playerField.Hand.ChildAdded.Connect(layoutCards)
    playerField.Hand.ChildRemoved.Connect(layoutCards)

    // Field zone animations
    const animateZone = (card3D: Card3D, zone: Vector3Value) => {
        const card2D = (card3D as Card3D).card2D.Value
        const position = card2D.getPosition!.InvokeServer() as Position
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
                animateZone(card3D as Card3D, zone as Vector3Value)

                const card2D = (card3D as Card3D).card2D.Value
                connections[card2D.getUid!.InvokeServer() as string] =
                    card2D.positionChanged!.OnClientEvent.Connect(() => {
                        if (card2D.getLocation!.InvokeServer() === zone.Name) {
                            animateZone(card3D as Card3D, zone as Vector3Value)
                        }
                    })
            })
            zone.ChildRemoved.Connect((card3D) => {
                const card2D = (card3D as Card3D).card2D.Value
                connections[card2D.getUid!.InvokeServer() as string].Disconnect()
            })
        })
})
