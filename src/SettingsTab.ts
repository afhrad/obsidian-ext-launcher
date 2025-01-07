import type {App} from "obsidian";
import {PluginSettingTab, Setting} from "obsidian";
import { settingsStore } from "./settingsStore";
import ScriptView from "./ui/svelte/ScriptView.svelte";
import type ScriptLauncherPlugin from "./main";
import type {Script} from "./Script";

export interface IScriptLauncherSettings {
	scripts: Script[];
}

export const DEFAULT_SETTINGS: IScriptLauncherSettings = {
	scripts: [],
}

export class SettingsTab extends PluginSettingTab {
	plugin: ScriptLauncherPlugin;
	scriptView: ScriptView;

	constructor(app: App, plugin: ScriptLauncherPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	async display(): Promise<void> {
		const {containerEl} = this;
		containerEl.empty()
		containerEl.createEl("h2", {text: "External Programs / Scripts"});

		this.addScriptTableView();
	}

	private addScriptTableView(): void {
		const setting = new Setting(this.containerEl);
		setting.infoEl.remove();
		setting.settingEl.className = "scriptTableView";

		this.scriptView = new ScriptView({
			target: setting.settingEl,
			props: {
				app: this.app,
				plugin: this.plugin,
				scripts: settingsStore.getState().scripts,
				saveScripts: (scripts: Script[]) => {
					settingsStore.setState({ scripts });
				},
			},
		});
	}

}
