import Roact from "@rbxts/roact"
import useYGOPlayer from "gui/hooks/useYGOPlayer"

export default () => {
    const player = useYGOPlayer();

    return (
        <frame BackgroundTransparency={1} Size={new UDim2(0,200,0,150)}>
            <uilistlayout/>
            <textlabel Text="Make a move?"></textlabel>
            <frame>
                <uilistlayout FillDirection="Horizontal"/>
                <textbutton Text="Yes"></textbutton>
                <textbutton Text="No"></textbutton>
            </frame>
        </frame>
    )
}