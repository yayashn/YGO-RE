import Roact, { useEffect, useRef } from '@rbxts/roact'
import Flex from 'shared/components/Flex'
import Padding from 'shared/components/Padding'
import { packs, packScroll, pack, packPrice, packButtons, packButton } from './Shop.styles'
import Remotes from 'shared/net/remotes'
import alert from 'shared/popups/alert'
import { Players } from '@rbxts/services'
import usePackAnimation from 'gui/hooks/usePackAnimation'
import useButtons from 'gui/hooks/useButtons'

const buyPack = Remotes.Client.Get("buyPack");
const alertPack = Remotes.Client.Get("alertPack");
const player = Players.LocalPlayer;

export default function Shop() {
    const [packAnimation, setPackAnimation] = usePackAnimation()
    const scrollRef = useRef<ScrollingFrame>()

    const [buttons, setButtons] = useButtons()

    useEffect(() => {
        setButtons([])
    }, [])

    const onPurchase = async (pack: string) => {
        const newPack = buyPack.CallServer(pack);
        if(newPack !== false){
            setPackAnimation(newPack);
        } else {
            await alert("Cannot purchase pack.", player);
        }
    }

    const onAlert = async (pack: string) => {
        alertPack.SendToServer(pack);
    }

    return (
        <frame {...packs}>
            <Flex flexDirection="column" gap={new UDim(0, 10)} />
            <scrollingframe ref={scrollRef} {...packScroll}>
                <Flex flexDirection="column" gap={new UDim(0, 10)} />
                <imagelabel {...pack} Image="rbxassetid://13064039998">
                    <Flex alignItems="center" justifyContent="start" />
                    <Padding PaddingInline={new UDim(0, 11)} />
                    <uicorner CornerRadius={new UDim(0, 8)} />
                    <textlabel {...packPrice} Text={`Legend of Blue-Eyes White Dragon\n1000 DP`} />
                    <frame {...packButtons}>
                        <Flex alignItems="end" justifyContent="end" gap={new UDim(0, 10)} />
                        <Padding PaddingBottom={new UDim(0, 11)} />
                        <textbutton
                            {...packButton}
                            Event={{
                                MouseButton1Click: () => onAlert("LOB")
                            }}
                            Text="Info"
                        >
                            <Padding PaddingInline={new UDim(0, 11)} />
                            <uicorner CornerRadius={new UDim(0, 6)} />
                        </textbutton>
                        <textbutton {...packButton} Text="Purchase"
                            Event={{
                                MouseButton1Click: () => onPurchase("LOB")  
                            }}
                        >
                            <Padding PaddingInline={new UDim(0, 11)} />
                            <uicorner CornerRadius={new UDim(0, 6)} />
                        </textbutton>
                    </frame>
                </imagelabel>
                <imagelabel {...pack} Image="rbxassetid://13064040480" ImageTransparency={0.7}>
                    <Flex alignItems="center" justifyContent="start" />
                    <Padding PaddingInline={new UDim(0, 11)} />
                    <uicorner CornerRadius={new UDim(0, 8)} />
                    <textlabel {...packPrice} Text={`Metal Raiders \nCOMING SOON`} />
                    <frame {...packButtons}>
                        <Flex alignItems="end" justifyContent="end" gap={new UDim(0, 10)} />
                        <Padding PaddingBottom={new UDim(0, 11)} />
                    </frame>
                </imagelabel>
            </scrollingframe>
        </frame>
    )
}