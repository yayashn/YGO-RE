import Roact from '@rbxts/roact'
import { withHooks } from '@rbxts/roact-hooked'
import usePrompt from 'gui/hooks/usePrompt'
import useYGOPlayer from 'gui/hooks/useYGOPlayer'
import Dialog from 'server/gui/Dialog'

export default withHooks(() => {
    const YGOPlayer = useYGOPlayer()
    const YGOOpponent = useYGOPlayer(true)
    const prompt = usePrompt(YGOPlayer!)
    const promptOpponent = usePrompt(YGOOpponent!)

    return (
        <Roact.Fragment>
            {prompt !== '' &&
                <Dialog
                    message={prompt}
                    options={[
                        {
                            text: 'NO',
                            MouseButton1Click: () => {
                                YGOPlayer!.promptResponse.Value = 'NO'
                                YGOPlayer!.promptMessage.Value = ''
                            }
                        },
                        {
                            text: 'YES',
                            MouseButton1Click: () => {
                                YGOPlayer!.promptResponse.Value = 'YES'
                                YGOPlayer!.promptMessage.Value = ''
                            }
                        }
                    ]}
                />
            }
            {promptOpponent !== '' && <Dialog message='Waiting for opponent to respond...'/>}
        </Roact.Fragment>
    )
})
