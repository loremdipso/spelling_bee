<script lang="ts">
	import SmallButton from "../common/SmallButton.svelte";
	import Word from "./Word.svelte";
	import type { IPlayer, IWord } from "interfaces";
	import TextField from "smelte/src/components/TextField";
	import { createEventDispatcher } from "svelte";

	export let player: IPlayer;
	export let isPlaying: boolean;

	let dispatch = createEventDispatcher();

	function delete_word(wordToDelete: IWord) {
		player.words = player.words.filter((word) => word !== wordToDelete);
		update_player();
	}

	function add_word() {
		player.words.push({ text: "" });
		update_player();
	}

	function update_word(word: IWord) {
		update_player();
	}

	function update_player() {
		player = player;
		dispatch("player_update");
	}

	$: score = player.words.reduce(
		(score, word) => score + (word.correct ? 1 : 0),
		0
	);

	$: {
		if (
			!isPlaying &&
			(!player.words.length || player.words[player.words.length - 1].text)
		) {
			add_word();
		}
	}
</script>

<div
	class="player-container m-2 p-2 bg-white dark:bg-gray-600 duration-200 rounded ease-in shadow-sm hover:shadow"
>
	{#if !isPlaying}
		<div>
			<SmallButton
				color="blue"
				icon="close"
				title=""
				on:click={() => dispatch("delete")}
			/>
		</div>
	{/if}

	<div class="player-content">
		{#if isPlaying}
			<h4>
				{player.name}
			</h4>

			<h5>
				Score: {score}
			</h5>
		{:else}
			<TextField
				bind:value={player.name}
				on:keyup={() => update_player()}
				placeholder="Name"
			/>
		{/if}

		{#each player.words as word, i}
			<Word
				bind:word
				{isPlaying}
				on:delete={() => delete_word(word)}
				on:add_word={() => add_word()}
				on:update_word={() => update_word(word)}
			/>
		{/each}
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
