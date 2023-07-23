import Roact from "@rbxts/roact";

interface FlexProps {
    flexDirection?: "row" | "column"
    justifyContent?: "start" | "end" | "center"
    alignItems?: "start" | "end" | "center" | "stretch"
    gap?: UDim
}

export default function Flex({
    flexDirection = "row",
    justifyContent = "start",
    alignItems = "start",
    gap = new UDim(0,0)
}: FlexProps) {

    let horizontalAlignment: Enum.HorizontalAlignment
    let verticalAlignment: Enum.VerticalAlignment

    const fillDirection = flexDirection === "row" ? Enum.FillDirection.Horizontal : Enum.FillDirection.Vertical

    if(flexDirection === "row") {
        horizontalAlignment = justifyContent === "start" ? Enum.HorizontalAlignment.Left :
            justifyContent === "end" ? Enum.HorizontalAlignment.Right : Enum.HorizontalAlignment.Center 
        verticalAlignment = alignItems === "start" ? Enum.VerticalAlignment.Top :
            alignItems === "end" ? Enum.VerticalAlignment.Bottom : Enum.VerticalAlignment.Center
    } else {
        horizontalAlignment = alignItems === "start" ? Enum.HorizontalAlignment.Left :
            alignItems === "end" ? Enum.HorizontalAlignment.Right : Enum.HorizontalAlignment.Center 
        verticalAlignment = justifyContent === "start" ? Enum.VerticalAlignment.Top :
            justifyContent === "end" ? Enum.VerticalAlignment.Bottom : Enum.VerticalAlignment.Center
    }

    return <uilistlayout
        FillDirection={fillDirection}
        HorizontalAlignment={horizontalAlignment}
        SortOrder={Enum.SortOrder.LayoutOrder}
        VerticalAlignment={verticalAlignment}
        Padding={gap}
    />
}