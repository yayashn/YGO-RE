interface Workspace extends Model {
	testValue: StringValue;
	Camera: Camera;
	Field3D: Model & {
		Phases: Part;
		Pri: Part;
		Card: Part & {
			Menu: ClickDetector;
			card2D: ObjectValue;
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
			Opponent: Model & {
				GZone: Part;
				EZone: Part;
				FZone: Part;
				BZone: Part;
				Cards: Model;
				Deck: Part;
				Attack: Model & {
					MZone1P: Part & {
						Gui: SurfaceGui & {
							Sword: ImageLabel;
						};
					};
					MZone4P: Part & {
						Gui: SurfaceGui & {
							Sword: ImageLabel;
						};
					};
					MZone5P: Part & {
						Gui: SurfaceGui & {
							Sword: ImageLabel;
						};
					};
					MZone3P: Part & {
						Gui: SurfaceGui & {
							Sword: ImageLabel;
						};
					};
					MZone2P: Part & {
						Gui: SurfaceGui & {
							Sword: ImageLabel;
						};
					};
				};
				Hand: Model & {
					Center: Part;
				};
				Field: Model & {
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
			};
			Player: Model & {
				GZone: Part;
				EZone: Part;
				FZone: Part;
				BZone: Part;
				Cards: Model;
				Attack: Model & {
					MZone1P: Part & {
						Gui: SurfaceGui & {
							Sword: ImageLabel;
						};
					};
					MZone4P: Part & {
						Gui: SurfaceGui & {
							Sword: ImageLabel;
						};
					};
					MZone5P: Part & {
						Gui: SurfaceGui & {
							Sword: ImageLabel;
						};
					};
					MZone3P: Part & {
						Gui: SurfaceGui & {
							Sword: ImageLabel;
						};
					};
					MZone2P: Part & {
						Gui: SurfaceGui & {
							Sword: ImageLabel;
						};
					};
				};
				Hand: Model & {
					Center: Part;
				};
				Field: Model & {
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
			};
		};
	};
	Model: Model & {
		["Duel Arena"]: Model & {
			Bleacher3: Model & {
				Bleacher3: Model;
			};
			SpawnLocation: SpawnLocation;
			ArenaBleachers: Model & {
				bleachers: Model;
			};
		};
	};
}
