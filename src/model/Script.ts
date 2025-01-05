import {CursorPlacement, type IScript} from "./IScript";
import {v4 as uuidv4} from "uuid";

export class Script implements IScript {
	id: string;
	name: string;
	externalProgram: string;
	// @ts-ignore
	additional_args: IArguments[];
	insert_handling: CursorPlacement;
	currentWorkingDirectory: string;
	debug_output: boolean;

	constructor(name: string) {
		this.name = name;
		this.id = uuidv4();
		this.additional_args = [];
		this.externalProgram = "";
		this.insert_handling = CursorPlacement.None;
		this.currentWorkingDirectory = "";
		this.debug_output = false;
	}
}
