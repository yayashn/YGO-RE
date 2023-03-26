import Roact from "@rbxts/roact";
import RowindElement from "./RowindElement";

interface RowindProps extends Roact.PropsWithChildren<{}> {
    className?: string
    Event?: Roact.JsxInstanceEvents<TextButton> | undefined,
    Text?: string,
    ref?: Roact.Ref<TextButton>,
    key?: string | number
}

export default (props: RowindProps) => {
    return (
        <RowindElement key={props.key} ref={props.ref} Event={props.Event} Text={props.Text || ""}
        tagName="button" className={props.className || ""}>
            {props[Roact.Children]}
        </RowindElement>
    )
}