<script lang="ts">
	import Button from "smelte/src/components/Button";
	import SmallButton from "./common/SmallButton.svelte";
	import Word from "./Word.svelte";
	import type { IPlayer, IWord } from "interfaces";
	import TextField from "smelte/src/components/TextField";
	import { createEventDispatcher } from "svelte";

	export let player: IPlayer;

	let dispatch = createEventDispatcher();

	function delete_word(wordToDelete: IWord) {
		player.words = player.words.filter((word) => word !== wordToDelete);
	}

	function mark_word_correct(i: number, correct: boolean) {
		dispatch("player_update");
	}

	function add_word() {
		player.words.push({ text: "" });
		player = player;
	}
</script>

<div
	class="player-container m-2 p-2 bg-white dark:bg-gray-600 duration-200 rounded ease-in shadow-sm hover:shadow"
>
	<div>
		<SmallButton
			color="blue"
			icon="close"
			title=""
			on:click={() => dispatch("delete")}
		/>
	</div>

	<div class="player-content">
		<TextField bind:value={player.name} placeholder="Name" />

		{#each player.words as word, i}
			<Word
				bind:word
				on:delete={() => delete_word(word)}
				on:add_word={() => add_word()}
				on:correct={() => mark_word_correct(i, true)}
				on:incorrect={() => mark_word_correct(i, false)}
			/>
		{/each}

		<Button
			color="blue"
			remove="p-4"
			icon="plus"
			title="Add word"
			on:click={() => add_word()}
		>
			Add word
		</Button>
	</div>
</div>

<style lang="scss">
	.player-container {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.player-content {
		flex-grow: 1;
	}
</style>
