import Roact from "@rbxts/roact";
import { Div, Button, Text } from "gui/rowindcss";
import colours from "../colours";

interface Window extends Roact.PropsWithChildren<{}> {
    title: string
}

export default (props: Window) => {
    return (
        <Div className={`w-11/12 h-11/12 max-w-[1000px] aspect-[16/9] bg-[${colours.primary}] top-1/2 left-1/2 origin-center 
        rounded-[2%] px-[0.3%] py-[0.5%]`}>
            <Div className={`w-[15%] h-[10%] rounded-[20%] z-20 bg-[${colours.primary}] top-[-7%] left-[-0.3%] overflow-hidden`}>
                <Div className="bg-gray-900 w-[96%] h-[95%] top-[6%] left-[2%] rounded-[20%] px-[10%] z-[90]">
                    <Button Event={{
                        MouseButton1Click: () => {
                            
                        }
                    }}
                    className="h-1/2 aspect-[1] bg-red-600 rounded-[100%] text-white left-[-5%] top-[15%] z-[90] text-center" Text="×"/>
                </Div>
            </Div>
            <Div className="w-full h-full bg-gray-900 rounded-[2%] flex flex-col items-center p-[2%] gap-[2%] z-30">
                <Text className="text-white uppercase w-full h-[8%] font-bold z-50 text-center" Text={props.title}/>
                {props[Roact.Children]}
            </Div>
        </Div>
    )
}