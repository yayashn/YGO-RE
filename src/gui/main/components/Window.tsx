import Roact from "@rbxts/roact";
import { Div, Button, Text } from "shared/rowindcss";
import colours from "../colours";
import { useContext, withHooks } from "@rbxts/roact-hooked";
import PageContext from "../PageContext";

interface Window extends Roact.PropsWithChildren<{}> {
    page: string
}

export default withHooks((props: Window) => {
    const [page, setPage] = useContext(PageContext)

    return (
        <Div className={`w-11/12 h-11/12 max-w-[1000px] aspect-[16/9] bg-[${colours.primary}] top-1/2 left-1/2 origin-center 
        rounded-[2%] px-[0.3%] py-[0.5%]`}>
            <Div className={`w-[25%] h-[10%] rounded-[20%] z-20 bg-[${colours.primary}] top-[-7%] left-[-0.3%]`}>
                <Div className={`bg-gray-900 w-[97%] h-[95%] top-[6%] left-[1.3%] rounded-[20%] px-[10%] z-[90]`}>
                    <Button Event={{
                        MouseButton1Click: () => {
                            setPage("")
                        }
                    }}
                    className="h-11/12 aspect-[1] bg-red-600 rounded-[20%] text-white left-[-8%] top-[15%] z-[90] text-center" Text="×"/>
                </Div>
            </Div>
            <Div className={`w-full h-full bg-gray-900 rounded-[2%] flex flex-col items-center p-[2%] gap-[2%] z-30`}>
                <Text className="text-white uppercase w-full h-[8%] font-bold z-50 text-center" Text={props.page}/>
                {props[Roact.Children]}
            </Div>
        </Div>
    )
})