<script lang="ts">
	import SmallButton from "./common/SmallButton.svelte";
	import TextField from "smelte/src/components/TextField";
	import type { IWord } from "interfaces";
	import { createEventDispatcher } from "svelte";

	export let word: IWord;

	let dispatch = createEventDispatcher();

	function mark_word_correct() {
		word.correct = true;
		dispatch("correct");
	}

	function mark_word_incorrect() {
		word.correct = false;
		dispatch("incorrect");
	}

	function keyup_handler(event: KeyboardEvent) {
		if (event.key === "Enter") {
			dispatch("add_word");
		}
	}
</script>

<div class="word-container">
	<SmallButton
		color="blue"
		icon="close"
		title=""
		on:click={() => dispatch("delete")}
	/>
	<div class="word">
		<TextField
			bind:value={word.text}
			on:keyup={keyup_handler}
			placeholder="Word"
		/>
	</div>
	<SmallButton
		color="success"
		icon="check"
		title={word.correct ? "yay" : ""}
		on:click={() => mark_word_correct()}
	/>
	<SmallButton
		color="alert"
		icon="close"
		title={word.correct === false ? "boo" : ""}
		on:click={() => mark_word_incorrect()}
	/>
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
</style>
