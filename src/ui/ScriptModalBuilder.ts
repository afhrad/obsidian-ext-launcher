import {type App, type ButtonComponent, Modal, Setting} from "obsidian";
import ScriptLauncherPlugin from "../main";
import GenericInputPrompt from "./GenericInputPrompt";
import {ArgumentTemplate, CursorPlacement, type Script } from "../Script";

export class ScriptModalBuilder extends Modal {
	private resolvePromise: (input: Script) => void;
	private rejectPromise: (reason?: unknown) => void;
	private input: Script;
	public waitForClose: Promise<Script>;
	private didSubmit = false;
	script: Script;

	constructor(app: App, script: Script, private plugin: ScriptLauncherPlugin) {
		super(app);
		this.script = script;
		this.waitForClose = new Promise<Script>((resolve, reject) => {
			this.resolvePromise = resolve;
			this.rejectPromise = reject;
		});

		this.containerEl.addClass("addModal");
		this.open();

		this.display();
	}

	protected arraymove<T>(
		arr: T[],
		fromIndex: number,
		toIndex: number
	): void {
		if (toIndex < 0 || toIndex === arr.length) {
			return;
		}
		const element = arr[fromIndex];
		arr[fromIndex] = arr[toIndex];
		arr[toIndex] = element;
	}

	protected addCenteredChoiceNameHeader(): void {
		const headerEl: HTMLHeadingElement = this.contentEl.createEl("h2", {
			cls: "scriptHeader",
		});
		headerEl.setText(this.script.name);

		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		headerEl.addEventListener("click", async () => {
			try {
				const newName: string = await GenericInputPrompt.Prompt(
					this.app,
					this.script.name,
					"Script name",
					this.script.name
				);
				if (newName !== this.script.name) {
					this.script.name = newName;
					headerEl.setText(newName);
				}
			} catch (e) {
			}
		});
	}

	onClose() {
		super.onClose();
		this.resolvePromise(this.script);
		if (!this.didSubmit) this.rejectPromise("No answer given.");
		else this.resolvePromise(this.input);
	}

	protected display() {
		this.contentEl.empty();
		this.containerEl.addClass("templateChoiceBuilder");
		this.addCenteredChoiceNameHeader();
		this.addExternalProgram();
		this.addCurrentWorkingDir();
		this.addArguments();
		this.addInsertHandling();
		this.addDebugOutput();
	}

	private addExternalProgram(): void {
		new Setting(this.contentEl)
			.setName("External program/script")
			.setDesc("Full path to the program/script.")
			.addText((text) => {
				text.setValue(this.script.externalProgram);
				text.setPlaceholder("External program/script");
				text.onChange(() => {
					this.script.externalProgram = text.getValue();
				});
			});
	}

	addArguments(): void {
		new Setting(this.contentEl).setName("Additional Arguments").setHeading();
		this.script.additional_args.forEach(
			(_argument, index) => {
				const s = new Setting(this.contentEl)
					.addDropdown((dd) => {
						dd.addOption(ArgumentTemplate.Argument, "Argument");
						dd.addOption(ArgumentTemplate.VaultPath, "Vault path");
						dd.addOption(ArgumentTemplate.Filename, "Filename with extension");
						dd.addOption(ArgumentTemplate.FilenamePath, "Full path to the file");
						dd.addOption(ArgumentTemplate.FilenameNoExt, "Filename without extension");
						dd.addOption(ArgumentTemplate.FilenameRel, "Relative filename in vault");
						dd.addOption(ArgumentTemplate.FilenameFull, "Full filename in vault");
						dd.addOption(ArgumentTemplate.JSONStruct, "Obsidian internal parameter JSON object");
						dd.setValue(this.script.additional_args[index].template);
						dd.onChange(async (value) => {
							this.script.additional_args[index].template = <ArgumentTemplate>value;
							await this.plugin.saveSettings()
							this.display();
						});
					})

				if (this.script.additional_args[index].template === ArgumentTemplate.Argument) {
					s.addText((text) => {
						text.inputEl.addClass("argument-full-width");
						text.setValue(this.script.additional_args[index].argument);
						text.setPlaceholder("Argument");
						text.onChange(() => {
							this.script.additional_args[index].argument = text.getValue();
						});
					});
				} else {
					s.addText((text) => {
						text.inputEl.addClass("argument-full-width");
						text.inputEl.addClass("argument-disabled");
						text.setDisabled(true);
					});
				}
				s.addExtraButton((cb) => {
					cb.setIcon("up-chevron-glyph")
						.setTooltip("Move up")
						.onClick(() => {
							this.arraymove(
								this.script.additional_args,
								index,
								index - 1
							);
							this.plugin.saveSettings();
							this.display();
						});
				})
					.addExtraButton((cb) => {
						cb.setIcon("down-chevron-glyph")
							.setTooltip("Move down")
							.onClick(() => {
								this.arraymove(
									this.script.additional_args,
									index,
									index + 1
								);
								this.plugin.saveSettings();
								this.display();
							});
					})
					.addExtraButton((cb) => {
						cb.setIcon("cross")
							.setTooltip("Delete")
							.onClick(() => {
								this.script.additional_args.splice(
									index,
									1
								);
								this.plugin.saveSettings();
								this.display();
							});
					});
				s.infoEl.remove();
			}
		);

		new Setting(this.contentEl).addButton((button: ButtonComponent) => {
			button
				.setButtonText("Add new argument")
				.setTooltip("Add additional argument")
				.setCta()
				.onClick(() => {
					this.script.additional_args.push({
						argument: "",
						template: ArgumentTemplate.Argument
					});
					this.plugin.saveSettings();
					this.display();
				});
		});
	}

	private addCurrentWorkingDir(): void {
		new Setting(this.contentEl)
			.setName("Working Dir")
			.setDesc("Full Path to the working directory ('~' expands to home).")
			.addText((text) => {
				text.setValue(this.script.currentWorkingDirectory);
				text.setPlaceholder("Working directory");
				text.onChange(() => {
					this.script.currentWorkingDirectory = text.getValue();
				});
			});
	}

	private addDebugOutput(): void {
		new Setting(this.contentEl)
			.setName("Debug execution details in separate log window")
			.addToggle((toggleComponent) => {
				toggleComponent
					.setValue(this.script.debug_output.valueOf())
					.onChange((value) => {
						this.script.debug_output = value;
					});
			});
	}

	private addInsertHandling(): void {
		new Setting(this.contentEl)
			.setName("Handle output of script")
			.addDropdown((dd) => {
				dd.addOption(CursorPlacement.None, "Insert nothing");
				dd.addOption(CursorPlacement.Start, "Insert at cursor");
				dd.addOption(CursorPlacement.End, "Insert after cursor");
				dd.setValue(this.script.insert_handling);
				dd.onChange(async (value) => {
					this.script.insert_handling = <CursorPlacement>value;
					await this.plugin.saveSettings()
					this.display();
				});
			})
	}
}
