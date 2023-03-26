import Roact from "@rbxts/roact"
import { withHooks } from "@rbxts/roact-hooked";
import usePrompt from "gui/hooks/usePrompt";
import useYGOPlayer from "gui/hooks/useYGOPlayer"
import { Div, Text, Button } from "shared/rowindcss";

export default withHooks(() => {
    const YGOPlayer = useYGOPlayer()
    const prompt = usePrompt()

    return (
        <Roact.Fragment>
            {prompt !== "" && <Div className="items-center justify-center w-full min-h-[150px] max-w-[400px] bg-gray-800 left-1/2 top-1/2 origin-center rounded-[5%]">
                <Text className="w-full h-[100px] text-center text-white font-bold py-5 px-3"
                Text={prompt}/>
                <Div className="w-full h-[35px] flex items-end justify-center gap-[5%] top-[70%]">
                    <Button className="h-full w-[45%] bg-red-500 text-white font-bold text-center rounded-[15%]" 
                    Event={{
                        MouseButton1Click: () => {
                            YGOPlayer!.promptResponse.Value = "NO"
                            YGOPlayer!.promptMessage.Value = ""
                        }
                    }}
                    Text="NO"/>
                    <Button className="h-full w-[45%] bg-green-500 text-white font-bold text-center rounded-[15%]" 
                    Event={{
                        MouseButton1Click: () => {
                            YGOPlayer!.promptResponse.Value = "YES"
                            YGOPlayer!.promptMessage.Value = ""
                        }
                    }}
                    Text="YES"/>
                </Div>
            </Div>}
        </Roact.Fragment>
    )
})