<script lang="ts">
	import SmallButton from "../common/SmallButton.svelte";
	import TextField from "smelte/src/components/TextField";
	import type { IWord } from "interfaces";
	import { createEventDispatcher } from "svelte";

	export let word: IWord;
	export let isPlaying: boolean;

	let dispatch = createEventDispatcher();

	function mark_word_correct() {
		if (word.correct === true) {
			word.correct = undefined;
		} else {
			word.correct = true;
		}

		dispatch("update_word");
	}

	function mark_word_incorrect() {
		if (word.correct === false) {
			word.correct = undefined;
		} else {
			word.correct = false;
		}

		dispatch("update_word");
	}

	function keyup_handler(event: KeyboardEvent) {
		if (event.key === "Enter") {
			dispatch("add_word");
		} else {
			dispatch("update_word");
		}
	}
</script>

<div class="word-container">
	{#if !isPlaying}
		<SmallButton
			color="blue"
			icon="close"
			title=""
			on:click={() => dispatch("delete")}
		/>
	{/if}

	<div class="word">
		{#if isPlaying}
			<a
				href={`https://www.dictionary.com/browse/${word.text}`}
				target="_blank"
			>
				dict
			</a>
			<span class="spell-word">
				{word.text}
			</span>
		{:else}
			<TextField
				bind:value={word.text}
				on:keyup={keyup_handler}
				placeholder="Word"
			/>
		{/if}
	</div>
	{#if isPlaying}
		{#if word.correct}
			<SmallButton
				color="success"
				icon="check"
				title=""
				on:click={() => mark_word_correct()}
			/>
		{:else}
			<SmallButton
				color="dark"
				icon="check"
				title=""
				on:click={() => mark_word_correct()}
			/>
		{/if}

		{#if word.correct === false}
			<SmallButton
				color="alert"
				icon="close"
				title=""
				on:click={() => mark_word_incorrect()}
			/>
		{:else}
			<SmallButton
				color="dark"
				icon="close"
				title=""
				on:click={() => mark_word_incorrect()}
			/>
		{/if}
	{/if}
</div>

<style lang="scss">
	.word-container {
		display: flex;
		align-items: center;
		gap: 1rem;
		background-color: lightgray;

		.word {
			flex-grow: 1;
		}
	}

	.spell-word {
		letter-spacing: 0.3rem;
		margin-left: 0.5rem;
	}
</style>
