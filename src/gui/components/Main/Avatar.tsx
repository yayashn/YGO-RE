import Roact from '@rbxts/roact'
import { useEffect, useState, withHooks } from '@rbxts/roact-hooked';
import { Players, ServerScriptService } from '@rbxts/services';
import avatars from 'server/profile/avatars';

const player = script.FindFirstAncestorWhichIsA('Player')
const DEV = Players.GetChildren().size() === 0
const playersFolder = ServerScriptService.FindFirstChild("instances")!.FindFirstChild("players") as Folder;
let playerFolder: Folder;
let avatarValue: StringValue;
try {
    playerFolder = playersFolder.WaitForChild(player!.Name) as Folder;
    avatarValue = playerFolder!.WaitForChild("avatar") as StringValue   
} catch {
}

export default withHooks(() => {
    const [avatar, setAvatar] = useState<string>(avatars["Kuriboh"])

    return (
        <frame
            LayoutOrder={2}
            Size={new UDim2(0, 70, 0, 0)}
            AutomaticSize="Y"
            BackgroundTransparency={1}
        >
            <uilistlayout />
            <imagelabel 
            Image={avatar}
            Size={new UDim2(0, 70, 0, 70)}>
                <uistroke Thickness={10} LineJoinMode={Enum.LineJoinMode.Bevel} />
                <uipadding
                    PaddingLeft={new UDim(0, 10)}
                    PaddingRight={new UDim(0, 10)}
                    PaddingBottom={new UDim(0, 10)}
                    PaddingTop={new UDim(0, 10)}
                />
            </imagelabel>
        </frame>
    )
})