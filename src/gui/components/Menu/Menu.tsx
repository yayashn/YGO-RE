import Roact, { useEffect, useRef, useState } from '@rbxts/roact'
import Flex from 'shared/components/Flex'
import Padding from 'shared/components/Padding'
import DeckEditor from '../../pages/DeckEditor/DeckEditor'
import Decks from '../../pages/Decks/Decks'
import Shop from '../../pages/Shop/Shop'
import usePage from '../../hooks/usePage'
import useButtons from '../../hooks/useButtons'
import { backdrop, window, tabs, content, buttons, tabButton, tabButtonContent, tabButtonIcon, tabButtonText, tabButtonTextInactive, tabButtonBorder, tabButtonBorderActive, buttonHovered, button, buttonText } from './Menu.styles'
import { white } from 'shared/colours'

const tabsList = ['Decks', 'Shop']

export default function Menu() {
    const [page, setPage] = usePage()
    const [numberOfTabs, setNumberOfTabs] = useState(2)
    const tabsRef = useRef<Frame>()
    const [menuButtons, setButtons] = useButtons();

    useEffect(() => {
        if(!tabsRef.current) return

        const connections = [
            tabsRef.current.ChildAdded.Connect(() => {
                try {
                    setNumberOfTabs(tabsRef.current!.GetChildren().size() - 1)
                } catch {

                }
            }),
            tabsRef.current.ChildRemoved.Connect(() => {
                try {
                    setNumberOfTabs(tabsRef.current!.GetChildren().size() - 1)
                } catch {

                }
            })
        ]

        return () => {
            connections.forEach(c => c.Disconnect())
        }
    }, [tabsRef])

    return (
        <frame key="Menu-Backdrop" {...backdrop}>
            <Flex justifyContent="center" alignItems="center" />
            <frame {...window} key="Menu">
                <uisizeconstraint MaxSize={new Vector2(844, 709)} />
                <uicorner CornerRadius={new UDim(0, 10)} />
                <Padding PaddingInline={new UDim(0, 20)} PaddingBottom={new UDim(0, 20)} />
                <Flex flexDirection="column" />
                    <frame {...tabs} ref={tabsRef}>
                        <Flex />
                        {tabsList.map((p, i) => {
                            return (
                                <TabButton
                                    numberOfTabs={numberOfTabs}
                                    key={i}
                                    text={p}
                                    onClick={() => setPage({ name: p })}
                                    active={page.name === p}
                                />
                            )
                        })}
                        {!tabsList.includes(page.name as string) && (
                            <TabButton
                                numberOfTabs={numberOfTabs}
                                text={page.name as string}
                                LayoutOrder={-1}
                                onClick={() => {}}
                                active={true}
                            />    
                        )}
                    </frame>
                
                <frame {...content}>
                    <Padding PaddingTop={new UDim(0, 20)} />
                    {page.name === 'Decks' && <Decks />}
                    {page.name === 'Shop' && <Shop />}
                    {page.name === 'Deck Editor' && <DeckEditor />}
                </frame>
                <frame {...buttons}>
                    <Flex alignItems="end" justifyContent="center" gap={new UDim(0, 10)}/>
                    <Button onClick={() => {
                        setPage({ name: '' })
                    }} text="Close" />
                    {menuButtons.map((b) => {
                        return <Button onClick={b.onClick} text={b.text} />
                    })}
                </frame>
            </frame>
        </frame>
    )
}

const TabButton = ({
    text,
    onClick,
    active,
    numberOfTabs,
    LayoutOrder
}: {
    text: string
    onClick: Callback
    active: boolean
    numberOfTabs: number
    LayoutOrder?: number
}) => {
    return (
        <textbutton
            {...tabButton(numberOfTabs)}
            LayoutOrder={LayoutOrder || 0}
            Event={{
                MouseButton1Click: () => onClick()
            }}
        >
            <frame {...tabButtonContent}>
                <Flex justifyContent="center" alignItems="center" />
                <imagelabel {...tabButtonIcon} />
                <textlabel
                    {...(active ? tabButtonText : tabButtonTextInactive)}
                    Text={text}
                />
            </frame>
            <frame
                {...tabButtonBorder}
                {...(active ? tabButtonBorderActive : tabButtonBorder)}
            />
        </textbutton>
    )
}

const Button = ({ onClick, text }: { text: string; onClick: Callback }) => {
    const [hovered, setHovered] = useState(false)
    const [buttons] = useButtons()

    return (
        <imagebutton
            {...(hovered ? buttonHovered : button)}
            {...(buttons.size() > 0 ? { Size: new UDim2(1/(buttons.size() + 2), 0, 0, 48) } : {})}
            Event={{
                MouseEnter: () => setHovered(true),
                MouseLeave: () => setHovered(false),
                MouseButton1Click: () => onClick()
            }}
        >
            <Flex justifyContent="center" alignItems="center" />
            <uistroke Color={white} Transparency={0.3} Thickness={1} />
            <uicorner CornerRadius={new UDim(0, 8)} />
            <textlabel {...buttonText} Text={text} />
        </imagebutton>
    )
}