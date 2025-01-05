export enum ArgumentTemplate {
	Argument = "argument",
	VaultPath = "vault_path",
	Filename = "filename",
	FilenameExt = "filename_ext",
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
	filenameExt: string;
	filenameRel: string;
	filenameFull: string;
	editorX: number;
	editorY: number;
}

export interface IArgument {
	argument: string;
	template: ArgumentTemplate;
}

export interface IScript {
	id: string;
	externalProgram: string,
	currentWorkingDirectory: string,
	additional_args: IArgument[],
	name: string;
	insert_handling: CursorPlacement;
	debug_output: boolean;
}
