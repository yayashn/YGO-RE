export default (player = script.FindFirstAncestorWhichIsA("Player")!) => {
    const serverStorage = game.GetService("ServerStorage")
    const playerFolder = serverStorage.FindFirstChild("players")!.WaitForChild(player.Name)
    const deck = (playerFolder.FindFirstChild("deck") as StringValue).Value.split(",")
    while(deck.size() === 0) {
        wait()
    }
}