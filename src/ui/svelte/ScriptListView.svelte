<script lang="ts">
	import ScriptItemView from "./ScriptItemView.svelte";
	import type {Script} from "../../Script";

	export let scripts: Script[] = [];

</script>

<div
	class="choiceList"
	style="{scripts.length === 0 ? 'padding-bottom: 0.5rem' : ''}">
	{#each scripts as script(script.id)}
		<ScriptItemView
			on:deleteScript
			on:configureScript
			on:duplicateScript
			on:runScript
			bind:script
		/>
	{/each}
</div>

<style>
	.choiceList {
		width: auto;
		border: 0 solid black;
		overflow-y: auto;
		height: auto;
	}
</style>
