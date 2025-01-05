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

<div class="choiceListItem">
	<span class="choiceListItemName" bind:this={nameElement} />

	<ScriptRightButtons
		on:deleteScript={deleteScript}
		on:configureScript={configureScript}
		on:duplicateScript={duplicateScript}
		on:runScript={runScript}
	/>
</div>

<style></style>
