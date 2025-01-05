import {type App, MarkdownView, Notice} from "obsidian";
import type {IScriptExecutor} from "./IScriptExecutor";
import type ScriptLauncherPlugin from "../main";
import {CursorPlacement, type IScript, type ObsidianData} from "./IScript";
import * as path from 'path';
import * as fs from 'fs';
import {exec} from 'child_process';

export class ScriptExecutor implements IScriptExecutor {
	constructor(private app: App, private plugin: ScriptLauncherPlugin) {
	}

	obsidianData: ObsidianData = {
		editorX: 0, editorY: 0, filename: "", filenameExt: "", filenameFull: "", filenameRel: "", vaultPath: ""
	}

	async execute(script: IScript): Promise<void> {
		if (script.debug_output) {
			console.log(`Executing script: ${script.name}`);
		}

		//---------------------------------------------------------------------------
		// Collect all Obsidian Settings for the script
		//---------------------------------------------------------------------------
		this.obsidianData.vaultPath = this.plugin.getBasePath();
		if ( this.app.workspace.getActiveFile() && this.app.workspace.getActiveFile()?.path ) {
			this.obsidianData.filenameRel = <string>this.app.workspace.getActiveFile()?.path?.toString();
		}
		if ( this.app.workspace.getActiveFile() && this.app.workspace.getActiveFile()?.path ) {
			this.obsidianData.filename = path.basename(<string>this.app.workspace.getActiveFile()?.path?.toString());
			this.obsidianData.filenameExt = path.parse(this.obsidianData.filename).name
		}
		this.obsidianData.filenameFull = path.join(this.obsidianData.vaultPath, this.obsidianData.filenameRel);

		const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
		if (!editor) {
			return;
		} else {
			this.obsidianData.editorX = editor.getCursor().ch;
			this.obsidianData.editorY = editor.getCursor().line;
		}

		if (!fs.existsSync(script.externalProgram)) {
			console.error(`The external program ${script.externalProgram} does not exist.`);
			return;
		}

		if ( script.debug_output ) {
			console.log(this.obsidianData)
		}
		//---------------------------------------------------------------------------
		// Building the commandline
		//---------------------------------------------------------------------------
		let command = JSON.stringify(script.externalProgram);
		let commandArguments: string[] = [];

		for (let arg of script.additional_args) {
			if (arg.template === "vault_path") {
				commandArguments.push(JSON.stringify(this.obsidianData.vaultPath));
				if (script.debug_output) {
					console.log(`Vault path: ${this.obsidianData.vaultPath}`);
				}
			} else if (arg.template === "filename") {
				commandArguments.push(JSON.stringify(this.obsidianData.filename));
				if (script.debug_output) {
					console.log(`Filename: ${path.basename(this.obsidianData.filename)}`);
				}
			} else if (arg.template === "filename_ext") {
				commandArguments.push(JSON.stringify(this.obsidianData.filenameExt));
				if (script.debug_output) {
					console.log(`Filename withour extension: ${this.obsidianData.filenameExt}`);
				}
			} else if (arg.template === "filename_rel") {
				if (this.obsidianData.filenameRel != null) {
					commandArguments.push(JSON.stringify(this.obsidianData.filenameRel));
					if (script.debug_output) {
						console.log(`Relative filename: ${this.obsidianData.filenameRel}`);
					}
				}
			} else if (arg.template === "filename_full") {
				commandArguments.push(JSON.stringify(this.obsidianData.filenameFull));
				if (script.debug_output) {
					console.log(`Full filename: ${this.obsidianData.filenameFull}`);
				}
			} else if (arg.template === "json_struct") {
				commandArguments.push("'" + JSON.stringify(this.obsidianData) + "'");
				if (script.debug_output) {
					console.log(`JSON struct: '${this.obsidianData}'`);
				}
			} else {
				commandArguments.push(JSON.stringify(arg.argument));
				if (script.debug_output) {
					console.log(`Additional argument: ${arg.argument}`);
				}
			}
		}
		let fullCommand = `${command} ${commandArguments.join(" ")}`;
		if (script.debug_output) {
			console.log(`Full command: ${fullCommand}`);
		}
		//---------------------------------------------------------------------------
		// Execute the command
		//---------------------------------------------------------------------------
		exec(fullCommand, { cwd: script.currentWorkingDirectory }, (error: any, stdout: any, stderr: any) => {
			if (error) {
				console.log(`Error executing script ${script.name}: ${error}`)
				new Notice(`!!! Script ` + script.name + ` not executed successfully`);
				return;
			} else {
				if (script.debug_output) {
					console.log(`stdout: ${stdout}`);
					console.log(`stderr: ${stderr}`);
				}
				if (script.insert_handling == CursorPlacement.Start || script.insert_handling == CursorPlacement.End) {
					editor.replaceRange(stdout,
						{
							line: this.obsidianData.editorY,
							ch: this.obsidianData.editorX
						},
						{
							line: this.obsidianData.editorY,
							ch: this.obsidianData.editorX
						}
					);
					if (script.insert_handling == CursorPlacement.End) {
						editor.setCursor({
							line: this.obsidianData.editorY,
							ch: this.obsidianData.editorX + stdout.length
						});
					}
				}
				new Notice(`Script ` + script.name + ` executed successfully`);
			}
		});


	}

}
