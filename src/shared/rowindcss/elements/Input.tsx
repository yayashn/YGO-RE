import Roact from "@rbxts/roact";
import RowindElement from "./RowindElement";

interface RowindProps extends Roact.PropsWithChildren<{}> {
    className?: string,
    Text?: string,
    Event?: Roact.JsxInstanceEvents<TextBox> | undefined,
    ref?: Roact.Ref<TextBox>,
    placeholder?: string,
    key?: string | number
}

export default ({key, className = "", Text = "", Event, ref, placeholder=""}: RowindProps) => {
    return (
        <RowindElement key={key} placeholder={placeholder} ref={ref} Event={Event} tagName="input" Text={Text} className={className}/>
    )
}