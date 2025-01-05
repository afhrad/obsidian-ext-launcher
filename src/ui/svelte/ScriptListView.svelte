<script lang="ts">
	import type {IScript} from "../../model/IScript";
	import ScriptItemView from "./ScriptItemView.svelte";

	export let scripts: IScript[] = [];

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
