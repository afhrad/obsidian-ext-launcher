<script lang="ts">
	import {faTrash, faClone, faEdit, faPlay} from "@fortawesome/free-solid-svg-icons";
	import Icon from "svelte-awesome/components/Icon.svelte";
	import {createEventDispatcher} from "svelte";

	const dispatcher = createEventDispatcher();

	function emitDeleteScript() {
		dispatcher('deleteScript');
	}

	function emitConfigureScript() {
		dispatcher('configureScript');
	}

	function emitDuplicateScript() {
		dispatcher('duplicateScript');
	}
	function emitRunScript() {
		dispatcher('runScript');
	}
</script>

<div class="containerRight">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div role="button" tabindex="0" on:click={emitConfigureScript}
		 class="alignCenter clickable">
		<Icon data={faEdit}/>
	</div>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div role="button" tabindex="0" on:click={emitDuplicateScript}
		 class="alignCenter clickable">
		<Icon data={faClone}/>
	</div>

	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div role="button" tabindex="0" on:click={emitDeleteScript}
		 class="alignCenter clickable">
		<Icon data={faTrash}/>
	</div>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div role="button" tabindex="0" on:click={emitRunScript}
		 class="alignCenter clickable">
		<Icon data={faPlay}/>
	</div>
</div>

<style>
	.containerRight {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.clickable:hover {
		cursor: pointer;
	}

	.alignCenter {
		display: flex;
		align-items: center;
	}
</style>
