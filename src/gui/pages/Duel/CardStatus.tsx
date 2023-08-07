import Roact, { useEffect } from "@rbxts/roact";
import { Players } from "@rbxts/services";
import { CardPublic } from "server/duel/types";
import { includes } from "shared/utils";

const player = Players.LocalPlayer;

export const CardStatus = ({ card, Adornee }: { card: CardPublic; Adornee: Part }) => {
    const position = card.position
    const chainLink = card.chainLink

    return (
        <billboardgui
            key="Status"
            AlwaysOnTop={true}
            Size={new UDim2(70, 0, 100, 0)}
            ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
            Adornee={Adornee}
            Active={true}
            Enabled={false}
        >
            {(position === 'FaceUpAttack' || position === 'FaceUpDefense') &&
                includes(card.location, 'MZone') &&
                card.atk !== undefined &&
                card.def !== undefined && (
                    <textlabel
                        BackgroundTransparency={1}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        Size={new UDim2(1, 0, 0, 17)}
                        Position={
                            card.controller === player
                                ? new UDim2(0, 0, 1, 0)
                                : new UDim2(0, 0, 0, 0)
                        }
                        AnchorPoint={
                            card.controller === player ? new Vector2(0, 1) : new Vector2(0, 0)
                        }
                        Text={`${card.atk}/${card.def}`}
                        TextStrokeColor3={Color3.fromRGB(0, 0, 0)}
                        TextStrokeTransparency={0}
                        TextSize={20}
                        Font={Enum.Font.ArialBold}
                    />
                )}
            {chainLink !== undefined && chainLink !== 0 && (
                <imagelabel
                    Size={new UDim2(1, 0, 1, 0)}
                    BackgroundTransparency={1}
                    Image="rbxgameasset://Images/chain"
                    Position={new UDim2(0.5, 0, 0.5, 0)}
                    AnchorPoint={new Vector2(0.5, 0.5)}
                >
                    <uiaspectratioconstraint AspectRatio={1} />
                    <textlabel
                        BackgroundTransparency={1}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        Size={new UDim2(1, 0, 0, 17)}
                        Position={new UDim2(0.5, 0, 0.5, 0)}
                        AnchorPoint={new Vector2(0.5, 0.5)}
                        Text={`${chainLink}`}
                        TextXAlignment="Center"
                        TextYAlignment="Center"
                        TextStrokeColor3={Color3.fromRGB(0, 0, 0)}
                        TextStrokeTransparency={0}
                        TextSize={40}
                        Font={Enum.Font.ArialBold}
                    ></textlabel>
                </imagelabel>
            )}
        </billboardgui>
    )
}
