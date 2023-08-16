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
// Hand animations
const center = playerField.Hand.Center.Position;
const orientation = playerField.Hand.Center.Orientation;

const CARD_WIDTH = 20; 

const layoutCards = () => {
    const handCards = playerField.Hand.GetChildren().filter(
        (card3D) => card3D.Name === 'Card'
    ) as Part[];

    let gap = 35;
    if (handCards.size() > 5) {
        // Decrease the gap by a multiplier for every card beyond the fifth.
        // In this case, we decrease the gap by 10 units for each additional card.
        gap -= (handCards.size() - 5) * 10;
    }

    const totalCardsWidth = CARD_WIDTH * handCards.size();
    const totalGapWidth = gap * (handCards.size() - 1);
    const totalWidth = totalCardsWidth + totalGapWidth;

    let currentX = center.X - totalWidth / 2 + CARD_WIDTH / 2; // Adjusted start position for the first card.

    handCards.forEach((card3D) => {
        const tweenGoal = {
            Position: new Vector3(
                currentX,
                center.Y,
                center.Z
            )
        };
        card3D.Orientation = orientation;
        tweenService.Create(card3D, tweenInfo, tweenGoal).Play();

        currentX += CARD_WIDTH + gap;
    });
};



playerField.Hand.ChildAdded.Connect(layoutCards);
playerField.Hand.ChildRemoved.Connect(layoutCards);




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
        const { position, order } = (card2D.WaitForChild('getCard') as BindableFunction).Invoke() as CardPublic
        
        let tweenGoal: { CFrame: CFrame } = { CFrame: new CFrame() }

        tweenGoal.CFrame = positionOrientation[playerField.Name as 'Player' | 'Opponent'][
            position
        ].add(zone.Position).add(new Vector3(0, order * .5, 0))

        tweenService
            .Create(card3D, tweenInfo, tweenGoal as Partial<ExtractMembers<Instance, Tweenable>>)
            .Play()
    }

    const connections: Record<string, RBXScriptConnection> = {};

    ["FZone", "EZone", "BZone", "GZone", "Deck"].forEach((zoneName) => {
        playerField[zoneName as "FZone"].ChildAdded.Connect(async (card3D) => {
            animateZonePart(card3D as Part, playerField[zoneName as "FZone"])
    
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
                if (location === playerField[zoneName as "FZone"].Name) {
                    animateZonePart(card3D as Part, playerField[zoneName as "FZone"])
                }
            })
        })
        playerField[zoneName as "FZone"].ChildRemoved.Connect(async (card3D) => {
            const card2D = (card3D.FindFirstChild('card2D') as ObjectValue).Value!
    
            const { uid } = (card2D.WaitForChild('getCard') as BindableFunction).Invoke() as {
                uid: string
            }
    
            connections[uid].Disconnect()
        })
    })
})
