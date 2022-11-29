import get3DLocation from "shared/get3DLocation";
import { CardGui } from "shared/types";
import { remote } from "shared/utils";

const field = game.Workspace.Field3D;
const card3DTemplate = field.Card;

remote<RemoteEvent>("createCard3D").OnClientEvent.Connect((card: CardGui) => {
	const card3D = card3DTemplate.Clone();
	(card3D.card2D as ObjectValue).Value = card;
	(card.FindFirstChild("card3D")! as ObjectValue).Value = card3D;
	const [location] = get3DLocation(card, true) as [Instance, Vector3];
	card3D.Parent = location;
	card3D.Name = card.Name;

	const cardSleeveGui = card.FindFirstChild("sleeve")! as SurfaceGui;
	cardSleeveGui.Adornee = card3D;
	cardSleeveGui.Face = Enum.NormalId.Top;
	const cardSleeve = cardSleeveGui.FindFirstChildWhichIsA("ImageLabel")!;
	cardSleeve.AnchorPoint = new Vector2(0.5, 0.5);
	cardSleeve.Size = new UDim2(1, 0, 1, 0);
	cardSleeve.Position = new UDim2(0.5, 0, 0.5, 0);
	cardSleeve.BackgroundTransparency = 1;

	const cardImageGui = card.FindFirstChild("image")! as SurfaceGui;
	cardImageGui.Adornee = card3D;
	cardImageGui.Face = Enum.NormalId.Bottom;
	const cardImage = cardImageGui.FindFirstChildWhichIsA("ImageLabel")!;
	cardImage.AnchorPoint = new Vector2(0.5, 0.5);
	cardImage.Size = new UDim2(1, 0, 1, 0);
	cardImage.Position = new UDim2(0.5, 0, 0.5, 0);
	cardImage.BackgroundTransparency = 1;
});
