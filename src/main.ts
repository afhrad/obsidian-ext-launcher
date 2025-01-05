import {FileSystemAdapter, Plugin} from 'obsidian';
import {DEFAULT_SETTINGS, SettingsTab, type IScriptLauncherSettings} from "./SettingsTab";
import {settingsStore} from "./settingsStore";
import type {IScript} from "./model/IScript";
import {ScriptExecutor} from "./model/ScriptExecutor";

export default class ScriptLauncherPlugin extends Plugin {
	settings: IScriptLauncherSettings;
	static instance: ScriptLauncherPlugin;

	private unsubscribeSettingsStore: () => void;

	async onload() {
		ScriptLauncherPlugin.instance = this;
		await this.loadSettings();
		settingsStore.setState(this.settings);
		this.unsubscribeSettingsStore = settingsStore.subscribe((settings) => {
			this.settings = settings;
			void this.saveSettings();
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingsTab(this.app, this));
		this.settings.scripts.forEach((script) => {
			this.addCommandForScript(script);
		});
	}

	onunload() {
		// Save the settings when the plugin is unloaded
		this.unsubscribeSettingsStore?.call(this);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	public addCommandForScript(script: IScript) {
		this.addCommand({
			id: `scriptlauncher:script:${script.id}`,
			name: script.name,
			callback: async () => {
				await new ScriptExecutor(this.app, this).execute(script);
			},
		});
	}

	public removeCommandForScript(script: IScript) {
		this.removeCommand(`scriptlauncher:script:${script.id}`);
	}

	public getBasePath(): string {
		let basePath;
		if (this.app.vault.adapter instanceof FileSystemAdapter) {
			basePath = this.app.vault.adapter.getBasePath();
		} else {
			throw new Error('Cannot determine base path.');
		}
		return `${basePath}`;
	}


}

