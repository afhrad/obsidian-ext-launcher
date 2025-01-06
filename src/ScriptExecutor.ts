import {type App, MarkdownView, Notice} from "obsidian";
import type ScriptLauncherPlugin from "./main";
import * as path from 'path';
import * as fs from 'fs';
import {exec} from 'child_process';
import {CursorPlacement, type Script, type ObsidianData} from "./Script";
import * as os from "os";
import {LogViewer} from "./ui/LogViewer";

export interface IScriptExecutor {
	execute(script: Script): Promise<void>;
	obsidianData: ObsidianData;
}

export class ScriptExecutor implements IScriptExecutor {
	constructor(private app: App, private plugin: ScriptLauncherPlugin) {
	}

	obsidianData: ObsidianData = {
		editorX: 0, editorY: 0, filename: "", filenameNoExt: "", filenameFull: "", filenameRel: "", vaultPath: "", filenamePath: ""
	}

	expandTilde(filePath: string): string {
		if (!filePath || filePath[0] !== '~') {
			return filePath;
		}
		const homeDir = os.homedir();
		return path.join(homeDir, filePath.slice(1));
	}

	async execute(script: Script): Promise<void> {
		//---------------------------------------------------------------------------
		// Collect all Obsidian Settings for the script
		//---------------------------------------------------------------------------
		this.obsidianData.vaultPath = this.plugin.getBasePath();
		if ( this.app.workspace.getActiveFile() && this.app.workspace.getActiveFile()?.path ) {
			this.obsidianData.filenameRel = <string>this.app.workspace.getActiveFile()?.path?.toString();
		}
		if ( this.app.workspace.getActiveFile() && this.app.workspace.getActiveFile()?.path ) {
			this.obsidianData.filename = path.basename(<string>this.app.workspace.getActiveFile()?.path?.toString());
			this.obsidianData.filenameNoExt = path.parse(this.obsidianData.filename).name
		}
		this.obsidianData.filenameFull = path.join(this.obsidianData.vaultPath, this.obsidianData.filenameRel);
		this.obsidianData.filenamePath = path.dirname(this.obsidianData.filenameFull);

		const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
		if (!editor) {
			return;
		} else {
			this.obsidianData.editorX = editor.getCursor().ch;
			this.obsidianData.editorY = editor.getCursor().line;
		}

		script.externalProgram = this.expandTilde(script.externalProgram);
		if (!fs.existsSync(script.externalProgram)) {
			new Notice(`The external program ${script.externalProgram} does not exist.`);
			return;
		}
		//---------------------------------------------------------------------------
		// Building the commandline
		//---------------------------------------------------------------------------
		let command = JSON.stringify(script.externalProgram);
		let commandArguments: string[] = [];

		for (let arg of script.additional_args) {
			if (arg.template === "vault_path") {
				commandArguments.push(JSON.stringify(this.obsidianData.vaultPath));
			} else if (arg.template === "filename") {
				commandArguments.push(JSON.stringify(this.obsidianData.filename));
			} else if (arg.template === "filename_path") {
				commandArguments.push(JSON.stringify(this.obsidianData.filenamePath));
			} else if (arg.template === "filename_no_ext") {
				commandArguments.push(JSON.stringify(this.obsidianData.filenameNoExt));
			} else if (arg.template === "filename_rel") {
				if (this.obsidianData.filenameRel != null) {
					commandArguments.push(JSON.stringify(this.obsidianData.filenameRel));
				}
			} else if (arg.template === "filename_full") {
				commandArguments.push(JSON.stringify(this.obsidianData.filenameFull));
			} else if (arg.template === "json_struct") {
				commandArguments.push("'" + JSON.stringify(this.obsidianData) + "'");
			} else {
				commandArguments.push(JSON.stringify(this.expandTilde(arg.argument)));
			}
		}
		let fullCommand = `${command} ${commandArguments.join(" ")}`;
		let debugInformation = ""
		//---------------------------------------------------------------------------
		// Execute the command
		//---------------------------------------------------------------------------
		const startTime = performance.now();
		const workingDirectory = this.expandTilde(script.currentWorkingDirectory);
		debugInformation += `Command: ${command}\n`
		debugInformation += `Full command: ${fullCommand}\n`
		debugInformation += `Working directory: ${workingDirectory}\n`
		debugInformation += "Obsidian Data Struct: " + JSON.stringify(this.obsidianData, null, 2) + "\n"
		for (let arg of commandArguments) {
			debugInformation += `- Argument: "${arg}"\n`
		}

		exec(fullCommand, { cwd: workingDirectory }, (error: any, stdout: any, stderr: any) => {
			const endTime = performance.now();
			const executionTime = endTime - startTime;

			const formatTime = (time: number) => {
				const milliseconds = Math.floor(time % 1000);
				const seconds = Math.floor((time / 1000) % 60);
				const minutes = Math.floor((time / (1000 * 60)) % 60);
				return `${minutes}m ${seconds}s ${milliseconds}ms`;
			};

			const formattedExecutionTime = formatTime(executionTime);
			debugInformation += `Executiontime: ${formattedExecutionTime}\n\n`;
			if (error) {
				new Notice(`!!! Script ` + script.name + ` not executed successfully`);
				debugInformation += `Error: ${error}`;
				if (script.debug_output) {
					new LogViewer(
						this.app,
						true,
						formattedExecutionTime,
						debugInformation
					);
				}
				return;
			} else {
				debugInformation += `stdout:\n ${stdout}\n`
				debugInformation += `stderr:\n ${stderr}\n`
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
				if (script.debug_output) {
					new LogViewer(
						this.app,
						false,
						formattedExecutionTime,
						debugInformation
					);
				}
			}
		});


	}

}
