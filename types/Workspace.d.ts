interface Workspace extends Model {
	Field3D: Model & {
		LP1: Part;
		Part: Part;
		FieldCam: Part;
		LP2: Part;
		Card: Part & {
			Menu: ClickDetector;
		};
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
		Phases: Part;
		Pri: Part;
		Field: Model & {
			Opponent: Model & {
				GZone: Vector3Value;
				Cards: Model;
				EZone: Vector3Value;
				FZone: Vector3Value;
				Deck: Vector3Value;
				BZone: Vector3Value;
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
				GZone: Vector3Value;
				Cards: Model;
				EZone: Vector3Value;
				FZone: Vector3Value;
				Deck: Vector3Value;
				BZone: Vector3Value;
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
	Camera: Camera;
	Baseplate: Part;
	Model: Model & {
		Leo: Model & {
			LeftLowerArm: MeshPart & {
				LeftElbowRigAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				LeftElbow: Motor6D;
				OriginalSize: Vector3Value;
				LeftWristRigAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
			};
			LeftFoot: MeshPart & {
				OriginalSize: Vector3Value;
				LeftAnkleRigAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				LeftAnkle: Motor6D;
			};
			RightHand: MeshPart & {
				RightWristRigAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				RightWrist: Motor6D;
				RightGripAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				OriginalSize: Vector3Value;
			};
			HumanoidRootPart: Part & {
				RootRigAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				OriginalSize: Vector3Value;
			};
			Shirt: Shirt;
			Pants: Pants;
			RightLowerLeg: MeshPart & {
				RightKneeRigAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				RightAnkleRigAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				RightKnee: Motor6D;
				OriginalSize: Vector3Value;
			};
			LeftUpperLeg: MeshPart & {
				OriginalSize: Vector3Value;
				LeftHip: Motor6D;
				LeftHipRigAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				LeftKneeRigAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
			};
			LeftLowerLeg: MeshPart & {
				OriginalSize: Vector3Value;
				LeftKnee: Motor6D;
				LeftAnkleRigAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				LeftKneeRigAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
			};
			DuelDisk1: Accessory & {
				Glass: Part;
				Handle: Part & {
					AccessoryWeld: Weld;
					OriginalSize: Vector3Value;
					LeftWristRigAttachment: Attachment;
				};
				Deck: Part & {
					SurfaceGui: SurfaceGui & {
						ImageLabel: ImageLabel;
					};
				};
				Colour: UnionOperation;
			};
			LowerTorso: MeshPart & {
				WaistCenterAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				LeftHipRigAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				Root: Motor6D;
				RootRigAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				RightHipRigAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				OriginalSize: Vector3Value;
				WaistRigAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				WaistBackAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				WaistFrontAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
			};
			Head: Part & {
				HatAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				OriginalSize: Vector3Value;
				NeckRigAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				FaceFrontAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				["Anime face"]: Decal;
				HairAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				Neck: Motor6D;
				Mesh: SpecialMesh & {
					OriginalSize: Vector3Value;
				};
				FaceCenterAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
			};
			SylvainHair: MeshPart & {
				WeldConstraint: WeldConstraint;
			};
			UpperTorso: MeshPart & {
				RightCollarAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				BodyBackAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				NeckRigAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				LeftCollarAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				OriginalSize: Vector3Value;
				Waist: Motor6D;
				RightShoulderRigAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				BodyFrontAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				WaistRigAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				LeftShoulderRigAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				NeckAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
			};
			BubbleChatUI: BillboardGui & {
				UIListLayout: UIListLayout;
				Empty: ImageLabel & {
					TextBox: TextBox;
					Script: Script;
				};
				MessageLabel: ImageLabel & {
					TextBox: TextBox;
				};
			};
			ClickDetector: ClickDetector & {
				Script: Script;
			};
			LeftUpperArm: MeshPart & {
				LeftShoulderRigAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				LeftShoulder: Motor6D;
				LeftShoulderAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				LeftElbowRigAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				OriginalSize: Vector3Value;
			};
			RightLowerArm: MeshPart & {
				RightWristRigAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				OriginalSize: Vector3Value;
				RightElbow: Motor6D;
				RightElbowRigAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
			};
			LeftHand: MeshPart & {
				LeftWrist: Motor6D;
				LeftGripAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				OriginalSize: Vector3Value;
				LeftWristRigAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
			};
			Humanoid: Humanoid & {
				Animator: Animator;
			};
			RightUpperArm: MeshPart & {
				OriginalSize: Vector3Value;
				RightElbowRigAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				RightShoulderRigAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				RightShoulderAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				RightShoulder: Motor6D;
			};
			RightUpperLeg: MeshPart & {
				RightKneeRigAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				OriginalSize: Vector3Value;
				RightHip: Motor6D;
				RightHipRigAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
			};
			RightFoot: MeshPart & {
				RightAnkleRigAttachment: Attachment & {
					OriginalPosition: Vector3Value;
				};
				RightAnkle: Motor6D;
				OriginalSize: Vector3Value;
			};
		};
		SpawnLocation: SpawnLocation;
		["Cardboard Box 3"]: MeshPart;
	};
}
