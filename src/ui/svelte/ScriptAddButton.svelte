<script lang="ts">
	import {createEventDispatcher} from "svelte";
	import {Notice} from "obsidian";

	let name: string;

	const dispatch = createEventDispatcher();

	function addScript() {
		if (!name) {
			new Notice("Script name is invalid.");
			return;
		}

		dispatch('addscript', {name});
		name = "";
	}


</script>

<div class="addChoiceBox">
	<input type="text" placeholder="Name" bind:value={name}>
	<button class="mod-cta" on:click={addScript}>Add New Script</button>
</div>

<style>
	.addChoiceBox {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 10px;
		justify-content: center;
	}

	@media (max-width: 800px) {
		.addChoiceBox {
			flex-direction: column;
		}
	}
</style>
