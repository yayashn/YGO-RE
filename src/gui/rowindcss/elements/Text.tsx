import Roact from "@rbxts/roact";
import RowindElement from "./RowindElement";

interface RowindProps extends Roact.PropsWithChildren<{}> {
    className?: string,
    Text?: string,
    Event?: Roact.JsxInstanceEvents<TextLabel> | undefined,
    ref?: Roact.Ref<TextLabel>,
    key?: string | number
}

export default (props: RowindProps) => {
    return (
        <RowindElement key={props.key} ref={props.ref} Event={props.Event} tagName="text" 
        Text={props.Text || ""} className={props.className || ""}>
            {props[Roact.Children]}
        </RowindElement>
    )
}