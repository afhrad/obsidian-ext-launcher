<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Component, htmlToMarkdown, MarkdownRenderer } from "obsidian";
	import ScriptRightButtons from "./ScriptActionButtons.svelte";
	import type {Script} from "../../Script";

	export let script: Script;
	const dispatcher = createEventDispatcher();

	function deleteScript() {
		dispatcher("deleteScript", { script: script });
	}

	function configureScript() {
		dispatcher("configureScript", { script: script });
	}

	function duplicateScript() {
		dispatcher("duplicateScript", { script: script });
	}

	function runScript() {
		dispatcher("runScript", { script: script });
	}

	const cmp = new Component();
	let nameElement: HTMLSpanElement;

	$: {
		if (nameElement) {
			nameElement.innerHTML = "";
			const nameHTML = htmlToMarkdown(script.name);
			MarkdownRenderer.renderMarkdown(
				nameHTML,
				nameElement,
				"/",
				cmp
			);
		}
	}
</script>

<div class="scriptListItem">
	<span class="scriptListItemName" bind:this={nameElement} />

	<ScriptRightButtons
		on:deleteScript={deleteScript}
		on:configureScript={configureScript}
		on:duplicateScript={duplicateScript}
		on:runScript={runScript}
	/>
</div>

<style>
	.scriptListItem {
		display: flex;
		font-size: 16px;
		align-items: center;
		margin: 0 0 0 0;
		transition: 1000ms ease-in-out;
	}
	.scriptListItemName {
		flex: 1 0 0;
	}
</style>
