import {v4 as uuidv4} from "uuid";

export enum ArgumentTemplate {
	Argument = "argument",
	VaultPath = "vault_path",
	Filename = "filename",
	FilenamePath = "filename_path",
	FilenameNoExt = "filename_no_ext",
	FilenameRel = "filename_rel",
	FilenameFull = "filename_full",
	JSONStruct = "json_struct"
}

export enum CursorPlacement {
	None = "none",
	Start = "start",
	End = "end",
}
export interface ObsidianData {
	vaultPath: string;
	filename: string;
	filenamePath: string;
	filenameNoExt: string;
	filenameRel: string;
	filenameFull: string;
	editorX: number;
	editorY: number;
}

export class Argument {
	argument: string;
	template: ArgumentTemplate;
}

export class Script {
	id: string;
	name: string;
	externalProgram: string;
	additional_args: Argument[];
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
