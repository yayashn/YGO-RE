import Roact from '@rbxts/roact'
import usePage from './hooks/usePage'
import Navbar from './components/Navbar'
import Flex from 'shared/components/Flex'
import { useEventListener } from 'shared/hooks/useEventListener'
import Remotes from 'shared/net/remotes'
import Duel from './pages/Duel/Duel'
import Menu from './components/Menu/Menu'
import PackAnimation from './pages/Shop/packAnimation'

const showField = Remotes.Client.Get('showField')

export default function App() {
    const [page] = usePage()
    const [isDueling, setIsDueling] = Roact.useState(false)

    useEventListener(showField, (bool) => {
        setIsDueling(bool)
    })

    return (
        <screengui IgnoreGuiInset key="App">
            {!isDueling && <Roact.Fragment key={3}>
                <Navbar />
                <PackAnimation/>
                {page.name !== "" && <Menu key={4}/>}
            </Roact.Fragment>}
        </screengui>
    )
}
