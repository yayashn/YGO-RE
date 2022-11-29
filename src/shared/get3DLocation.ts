import YGOCard from "./ygo/card";


const workspace = game.GetService("Workspace");
const players = game.GetService("Players");

export default (card: SurfaceGui, fromClient?: boolean) => {
	const field3D = workspace.FindFirstChild("Field3D")!.FindFirstChild("Field")!;
	const getCardInfo = fromClient
		? (card.FindFirstChild("getCardInfoPublic") as RemoteFunction)
		: (card.FindFirstChild("getCardInfo") as BindableFunction);
	const { location, controllerName, ownerName }: YGOCard = fromClient
		? (getCardInfo as RemoteFunction).InvokeServer()
		: (getCardInfo as BindableFunction).Invoke();
	let locationInstance;
	let locationVector3;
	if (location.match("MZone")[0] || location.match("SZone")[0]) {
		locationInstance = field3D
			.FindFirstChild(`Field${ownerName === controllerName ? "Player" : "Opponent"}`)!
			.FindFirstChild(location, true) as Vector3Value;
		locationVector3 = locationInstance.Value;
	} else if (location.match("Hand")[0]) {
		locationInstance = field3D.FindFirstChild(`Hand${ownerName === controllerName ? "Player" : "Opponent"}`)!;
		locationVector3 = (locationInstance.FindFirstChild("Center") as BasePart).Position;
	} else {
		locationInstance = field3D
			.FindFirstChild(`Alt${ownerName === controllerName ? "Player" : "Opponent"}`)!
			.FindFirstChild(location) as Vector3Value;
			print(`Alt${ownerName === controllerName ? "Player" : "Opponent"}`, location)
		locationVector3 = locationInstance.Value;
	}
	return [locationInstance, locationVector3];
};
