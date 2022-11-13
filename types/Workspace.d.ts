interface Workspace extends Model {
	Camera: Camera;
	Baseplate: Part & {
		Texture: Texture;
	};
	Field3D: Model & {
		LP2: Part;
		Pri: Part;
		LP1: Part;
		Card: Part & {
			LayoutOrder: IntValue;
			card2D: ObjectValue;
			Menu: ClickDetector;
		};
		Part: Part;
		FieldCam: Part;
		ZoneBGs: Model & {
			GZone: UnionOperation & {
				bg: Part;
			};
			GZoneO: UnionOperation & {
				Zone: Part;
			};
			EZone: UnionOperation & {
				Zone: Part;
			};
			EZoneO: UnionOperation & {
				Zone: Part;
			};
			BZone: UnionOperation & {
				Zone: Part;
			};
			FZoneO: UnionOperation & {
				Zone: Part;
			};
			BZoneO: UnionOperation & {
				Zone: Part;
			};
			DeckO: UnionOperation & {
				Zone: Part;
			};
			Deck: UnionOperation & {
				Zone: Part;
			};
			FZone: UnionOperation & {
				Zone: Part;
			};
		};
		Field: Model & {
			CardsOpponent: Model;
			HandOpponent: Model & {
				Center: Part;
			};
			AltOpponent: Model & {
				GZone: Vector3Value;
				EZone: Vector3Value;
				FZone: Vector3Value;
				Deck: Vector3Value;
				BZone: Vector3Value;
			};
			AltPlayer: Model & {
				GZone: Vector3Value;
				EZone: Vector3Value;
				FZone: Vector3Value;
				Deck: Vector3Value;
				BZone: Vector3Value;
			};
			FieldPlayer: Model & {
				MZone1: Vector3Value;
				SZone5: Vector3Value;
				Part: Part;
				SZone2: Vector3Value;
				SZone1: Vector3Value;
				Union: UnionOperation;
				SZone3: Vector3Value;
				MZone2: Vector3Value;
				MZone5: Vector3Value;
				MZone4: Vector3Value;
				SZone4: Vector3Value;
				MZone3: Vector3Value;
			};
			FieldOpponent: Model & {
				MZone4: Vector3Value;
				SZone5: Vector3Value;
				Part: Part;
				SZone2: Vector3Value;
				SZone1: Vector3Value;
				Union: UnionOperation;
				SZone3: Vector3Value;
				MZone2: Vector3Value;
				MZone5: Vector3Value;
				MZone1: Vector3Value;
				SZone4: Vector3Value;
				MZone3: Vector3Value;
			};
			HandPlayer: Model & {
				Center: Part;
			};
			CardsPlayer: Model;
		};
	};
}
