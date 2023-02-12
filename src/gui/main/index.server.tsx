import Roact from "@rbxts/roact";
import { useEffect, useRef, useState } from "@rbxts/roact-hooked";
import DeckBuilder from "./pages/DeckBuilder/DeckBuilder";
import { instance } from "shared/utils";
import PageContext from "./PageContext";
import { Button, Div, Text, Img } from "gui/rowindcss";
import colours from "./colours";

const player = script.FindFirstAncestorWhichIsA("Player")!
const playerGui = player.FindFirstChildWhichIsA("PlayerGui")
const pageValue = (player.FindFirstChild("page") || instance("StringValue", "page", player)) as StringValue

const Main = () => {
    const [page, setPage] = useState<string>("")

    const setPageValue = (page: string) => {
        pageValue.Value = page
    }

    useEffect(() => {
        pageValue.Changed.Connect((newPage) => {
            setPage(newPage)
        })
    }, [])

    return (
        <PageContext.Provider value={[page, setPageValue]}>
            <screengui IgnoreGuiInset={true}>
                {page === "Deck Builder" && <DeckBuilder/>}
                <Div className="top-0 left-full origin-top-right h-[42px] w-full py-1 px-3 flex justify-end">
                    <Button className={`bg-black bg-opacity-60 hover:bg-opacity-70 h-full aspect-[1] rounded-[30%] text-center p-1`}
                    Event={{
                        MouseButton1Click: () => {
                            setPageValue("Deck Builder")
                        }
                    }}>
                        <Img className="w-full h-full" src="rbxassetid://4943949493"/>
                    </Button>
                </Div>
            </screengui>
        </PageContext.Provider>
    )
}

Roact.mount(<Main/>, playerGui, "MainGui")