import Roact from "@rbxts/roact";

interface PaddingProps {
    PaddingTop?: UDim
    PaddingBottom?: UDim
    PaddingLeft?: UDim
    PaddingRight?: UDim
    Padding?: UDim
    PaddingBlock?: UDim
    PaddingInline?: UDim
}

export default function Padding({
    PaddingTop,
    PaddingBottom,
    PaddingLeft,
    PaddingRight,
    Padding,
    PaddingBlock,
    PaddingInline
}: PaddingProps) {
    const p = {
        PaddingTop: PaddingTop || PaddingBlock || Padding || new UDim(0,0),
        PaddingBottom: PaddingBottom || PaddingBlock || Padding || new UDim(0,0),
        PaddingLeft: PaddingLeft || PaddingInline || Padding || new UDim(0,0),
        PaddingRight: PaddingRight || PaddingInline || Padding || new UDim(0,0)
    }    

    return <uipadding {...p} />
}