import Roact from "@rbxts/roact";
import { Dispatch, SetStateAction, useEffect, useState, withHooks } from "@rbxts/roact-hooked";
import useCardStat from "gui/hooks/useCardStat";
import useDuelStat from "gui/hooks/useDuelStat";
import usePlayerStat from "gui/hooks/usePlayerStat";
import type { Card } from "server/duel/card";
import { getDuel } from "server/duel/duel";
import { YPlayer } from "server/duel/player";
import { Location, Phase, Position } from "server/duel/types";
import { includes } from "shared/utils";

type CardAction =
    | 'Activate'
    | 'Attack'
    | 'Normal Summon'
    | 'Tribute Summon'
    | 'Special Summon'
    | 'Set'
    | 'Flip Summon'
    | 'Change Position'

const player = script.FindFirstAncestorWhichIsA("Player")!;

export default withHooks(({ card, useShowMenu }: { card: Card, useShowMenu: [Card | undefined, Dispatch<SetStateAction<Card | undefined>>] }) => {
    const [showMenu, setShowMenu] = useShowMenu;
    const [enabledActions, setEnabledActions] = useState<CardAction[]>([]);
    const duel = getDuel(player)!;
    const yPlayer = duel.getPlayer(player);
    const position = useCardStat<"position", Position>(card, "position");
    const chainLink = useCardStat<"chainLink", number>(card, "chainLink");
    const location = useCardStat<"location", Location>(card, "location");
    const atk = useCardStat<"atk", number>(card, "atk");
    const def = useCardStat<"def", number>(card, "def");
    const action = usePlayerStat<"action", string>(yPlayer, "action");
    const actionOpponent = usePlayerStat<"action", string>(duel.getOpponent(player), "action");
    const floodgatesPlayer = usePlayerStat<"floodgates", string[]>(yPlayer, "floodgates");
    const floodgatesCard = useCardStat<"floodgates", string[]>(card, "floodgates");
    const actor = useDuelStat<"actor", YPlayer>(duel, "actor");
    const selectableZones = usePlayerStat<"selectableZones", Location[]>(yPlayer, "selectableZones");
    const chainResolving = useDuelStat<"chainResolving", boolean>(duel, "chainResolving");
    const gameState = useDuelStat<"gameState", string>(duel, "gameState");
    const battleStep = useDuelStat<"battleStep", string>(duel, "battleStep");
    const race = useCardStat<"race", string>(card, 'race');
    const type_ = useCardStat<"type", string>(card, 'type');
    const phase = useDuelStat<"phase", Phase>(duel, 'phase');

    const removeCardAction = (action?: CardAction) => {
        if (!action) return setEnabledActions([])
        setEnabledActions((actions) => actions.filter((a) => action !== a))
    }

    const addCardAction = (action: CardAction) => {
        if (enabledActions.includes(action)) return
        setEnabledActions((actions) => [...actions, action])
    }

    const isCardActionEnabled = (action: CardAction) => {
        return enabledActions.includes(action)
    }

    const cardActions = {
        Activate: () => {
            const cost = card.getCost()
            const target_ = card.getTarget()
            if(cost) {
               cost()
            }
            if(target_) {
                target_()
            }
            yPlayer.action.set({
                action: 'Activated Card',
            })
            card.activateEffect()
        },
        'Normal Summon': async () => {
            yPlayer.addFloodgate("CANNOT_NORMAL_SUMMON_AFTER_NORMAL_SUMMON")
            yPlayer.selectableZones.set(duel.getEmptyFieldZones('MZone', yPlayer.player, 'Player'))
            
            const connection = yPlayer.selectedZone.changed((zone) => {
                connection.Disconnect()
                card.normalSummon(zone as Location)
            })
            while (connection.Connected) {
                await Promise.delay(0)
            }
            yPlayer.selectedZone.set(undefined)
            yPlayer.selectableZones.set([])
            yPlayer.action.set({
                action: 'Normal Summon',
            })
        },
    }

    useEffect(() => {
        const inHand = location === 'Hand'
        const isMonster = includes(type_, "Monster");
        const isSpellTrap = !isMonster;
        const isActor = actor === yPlayer;
        const isSelecting = yPlayer.selectableZones.get().size() !== 0 || yPlayer.targettableCards.get().size() !== 0
        const conditionMet = card.checkEffectConditions()
        const isController = card.getController() === yPlayer
        
        if(!(!chainResolving && !isSelecting && isActor && isController)) return;

        //Normal Summon
        if (inHand && isMonster && includes(phase, "MP") && !yPlayer.getFloodgate("CANNOT_NORMAL_SUMMON") && !card.getFloodgate("CANNOT_NORMAL_SUMMON") && gameState === "OPEN") {
            addCardAction("Normal Summon")
        }
        
    }, [
        action, actionOpponent, floodgatesCard, floodgatesPlayer,
        actor, selectableZones, chainResolving, gameState, battleStep,
        showMenu, race, type_, phase, showMenu
    ])

    return (
        <Roact.Fragment>
            <billboardgui
                Enabled={showMenu === card}
                Active={true}
                Key="CardMenu"
                AlwaysOnTop={true}
                Size={new UDim2(70, 0, 100, 0)}
                ExtentsOffset={new Vector3(0, 0.2, 2)}
                ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
            >
                <uilistlayout Padding={new UDim(0.05, 0)} VerticalAlignment="Center" />
                {enabledActions.map((button: CardAction) => {
                    return (
                        <textbutton
                            Size={new UDim2(1, 0, 0, 30)}
                            Text={button}
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextSize={14}
                            TextStrokeColor3={Color3.fromRGB(0, 0, 0)}
                            TextStrokeTransparency={0}
                            TextXAlignment={Enum.TextXAlignment.Center}
                            TextYAlignment={Enum.TextYAlignment.Center}
                            Font={Enum.Font.ArialBold}
                            BorderSizePixel={1}
                            BackgroundColor3={new Color3(6 / 255, 52 / 255, 63 / 255)}
                            BorderColor3={new Color3(26 / 255, 101 / 255, 110 / 255)}
                            Event={{
                                MouseButton1Click: async (e) => {
                                    setShowMenu(undefined)
                                    if (!isCardActionEnabled(button)) return
                                    removeCardAction()
                                    if (button === "Attack") {
                                        wait(.1)
                                    };
                                    (cardActions as unknown as Record<string, Callback>)[button]()
                                }
                            }}
                        />
                    )
                })}
            </billboardgui>
            <billboardgui
                Key="Status"
                AlwaysOnTop={true}
                Size={new UDim2(70, 0, 100, 0)}
                ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
                Active={true}
            >
                {(position === "FaceUpAttack" || position === "FaceUpDefense") && includes(location || "", "MZone") && atk !== undefined && <textlabel
                    BackgroundTransparency={1}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    Size={new UDim2(1, 0, 0, 17)}
                    Position={card.getController() === yPlayer ? new UDim2(0, 0, 1, 0) : new UDim2(0, 0, 0, 0)}
                    AnchorPoint={card.getController() === yPlayer ? new Vector2(0, 1) : new Vector2(0, 0)}
                    Text={`${atk || 0}/${def || 0}`}
                    TextStrokeColor3={Color3.fromRGB(0, 0, 0)}
                    TextStrokeTransparency={0}
                    TextSize={20}
                    Font={Enum.Font.ArialBold} />}
                {chainLink !== 0 &&
                    <imagelabel
                        Size={new UDim2(1, 0, 1, 0)}
                        BackgroundTransparency={1}
                        Image="rbxgameasset://Images/chain"
                        Position={new UDim2(.5, 0, .5, 0)}
                        AnchorPoint={new Vector2(.5, .5)}>
                        <uiaspectratioconstraint AspectRatio={1} />
                        <textlabel
                            BackgroundTransparency={1}
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            Size={new UDim2(1, 0, 0, 17)}
                            Position={new UDim2(.5, 0, .5, 0)}
                            AnchorPoint={new Vector2(.5, .5)}
                            Text={`${chainLink}`}
                            TextXAlignment="Center"
                            TextYAlignment="Center"
                            TextStrokeColor3={Color3.fromRGB(0, 0, 0)}
                            TextStrokeTransparency={0}
                            TextSize={40}
                            Font={Enum.Font.ArialBold}>
                        </textlabel>
                    </imagelabel>
                }
                {card.checkEffectConditions() && card.getController() === yPlayer &&
                    <imagelabel
                        Size={new UDim2(1, 0, 0, 50)}
                        BackgroundTransparency={1}
                        Image="rbxgameasset://Images/activate"
                        Position={new UDim2(.5, 0, .5, 0)}
                        AnchorPoint={new Vector2(.5, .5)}>
                        <uiaspectratioconstraint AspectRatio={1} />
                    </imagelabel>
                }
            </billboardgui>
        </Roact.Fragment>
    )
})