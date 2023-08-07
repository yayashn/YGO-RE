import Roact from '@rbxts/roact'
import Dialog from 'server/popups/Dialog'
import { Subscribable } from 'shared/Subscribable'

const confirmSync = (message: string, player: Player) => {
    const answer = new Subscribable<'YES' | 'NO' | undefined>(undefined)

    const prompt = Roact.mount(
        <screengui key="Dialog" IgnoreGuiInset>
            <Dialog
                message={message}
                options={[
                    {
                        text: 'NO',
                        MouseButton1Click: () => {
                            answer.set('NO')
                            Roact.unmount(prompt)
                        }
                    },
                    {
                        text: 'YES',
                        MouseButton1Click: () => {
                            answer.set('YES')
                            Roact.unmount(prompt)
                        }
                    }
                ]}
            />
        </screengui>,
        player.FindFirstChildWhichIsA('PlayerGui')
    )

    answer.wait()
    return answer.get()
}

export default confirmSync
