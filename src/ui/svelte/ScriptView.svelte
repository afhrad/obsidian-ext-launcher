<script lang="ts">
	import {CursorPlacement, type IScript} from "../../model/IScript";
	import {App} from "obsidian";
	import {onMount} from "svelte";
	import ScriptListView from "./ScriptListView.svelte";
	import GenericYesNoPrompt from "../GenericYesNoPrompt";
	import {settingsStore} from "../../settingsStore";
	import ScriptAddButton from "./ScriptAddButton.svelte";
	import {Script} from "../../model/Script";
	import {ScriptModalBuilder} from "../ScriptModalBuilder";
	import ScriptLauncherPlugin from "../../main";
	import {ScriptExecutor} from "../../model/ScriptExecutor";

	export let scripts: IScript[] = [];

	export let saveScripts: (scripts: IScript[]) => void;
	export let app: App;
	export let plugin: ScriptLauncherPlugin;

	onMount(() => {
		const unsubSettingsStore = settingsStore.subscribe((settings) => {
			scripts = settings.scripts;
		});

		return () => {
			unsubSettingsStore();
		};
	});

	async function handleDuplicateScript(e: any) {
		const { script: sourceScript } = e.detail;

		const newScript = duplicateScriptHelper(sourceScript);

		scripts = [...scripts, newScript];
		saveScripts(scripts);
	}

	async function handleRunScript(e: any) {
		const script: IScript = e.detail.script;
		script.insert_handling = CursorPlacement.None;
		await new ScriptExecutor(app, plugin).execute(script);
	}

	async function handleDeleteScript(e: any) {
		const script: IScript = e.detail.script;
		const userConfirmed: boolean = await GenericYesNoPrompt.Prompt(
			app,
			`Delete Script?`,
			`Please confirm that you wish to delete '${script.name}'.`
		);

		if (!userConfirmed) return;

		scripts = scripts.filter((value) =>
			deleteScriptHelper(script.id, value)
		);
		plugin.removeCommandForScript(script);
		saveScripts(scripts);
	}

	async function handleConfigureScript(e: any) {
		const {script: oldScript} = e.detail;

		let updatedScript: IScript | null = null;
		const builder = new ScriptModalBuilder(
			app,
			oldScript,
			plugin
		);
		if (!builder) {
			throw new Error("Invalid choice type");
		}

		updatedScript = (await builder.waitForClose);

		if (!updatedScript) return;

		scripts = scripts.map((script) =>
			updateScriptHelper(script, updatedScript)
		);

		plugin.removeCommandForScript(oldScript);
		plugin.addCommandForScript(updatedScript);
		saveScripts(scripts);
	}

	function handleAddScript(event: any): void {
		const {name} = event.detail;
		const newscript: IScript = new Script(name);
		scripts = [...scripts, newscript];
		plugin.addCommandForScript(newscript);
		saveScripts(scripts);
	}


	function duplicateScriptHelper(script: IScript) {
		let newScript: IScript = new Script(`${script.name} (copy)`);
		newScript.insert_handling = script.insert_handling;
		newScript.debug_output = script.debug_output;
		newScript.externalProgram = script.externalProgram;
		newScript.currentWorkingDirectory = script.currentWorkingDirectory;
		newScript.additional_args = script.additional_args;
		return newScript;
	}

	function deleteScriptHelper(id: string, value: IScript): boolean {
		return value.id !== id;
	}

	function updateScriptHelper(oldScript: IScript, newScript: IScript) {
		if (oldScript.id === newScript.id) {
			oldScript = {...oldScript, ...newScript};
			return oldScript;
		}
		return oldScript;
	}
</script>

<div>
	<ScriptListView
		bind:scripts
		on:deleteScript={handleDeleteScript}
		on:configureScript={handleConfigureScript}
		on:duplicateScript={handleDuplicateScript}
		on:runScript={handleRunScript}
	/>
	<ScriptAddButton on:addscript={handleAddScript}></ScriptAddButton>
</div>
