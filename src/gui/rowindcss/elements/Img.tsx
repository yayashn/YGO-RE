import Roact from "@rbxts/roact";
import RowindElement from "./RowindElement";

interface RowindProps extends Roact.PropsWithChildren<{}> {
    className?: string,
    src?: string,
    Event?: Roact.JsxInstanceEvents<ImageLabel> | undefined,
    ref?: Roact.Ref<TextBox>,
    placeholder?: string,
    key?: string | number
}

export default ({className = "", src = "", Event, ref, placeholder="", key}: RowindProps) => {
    return (
        <RowindElement key={key} placeholder={placeholder} ref={ref} Event={Event} tagName="img" Text={src} className={className}/>
    )
}