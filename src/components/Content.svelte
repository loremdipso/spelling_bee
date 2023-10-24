<script lang="ts">
	import Button from "smelte/src/components/Button";
	import Player from "./Player.svelte";
	import type { IPlayer, IWord } from "interfaces";
	import { toaster } from "../common/Toast.svelte";
	import { shuffleArray } from "../common/misc";

	let isPlaying = false;
	let currentPlayerIndex = 0;

	function get_players_from_storage(): IPlayer[] {
		try {
			return JSON.parse(window.localStorage.getItem(DATA_KEY) || "");
		} catch {
			return [];
		}
	}

	const DATA_KEY = "spelling-bee-data";
	let players: IPlayer[] = get_players_from_storage();
	let players_backup: IPlayer[] = [];

	function delete_player(playerToDelete: IPlayer) {
		players = players.filter((player) => player !== playerToDelete);
	}

	function update_player(player: IPlayer) {
		// TODO: update scores, I guess?
		players = players;
	}

	function add_player() {
		players.push({ name: "", words: [], disallowed_words: [] });
		players = players;
	}

	function toggle_is_playing() {
		isPlaying = !isPlaying;
		if (isPlaying) {
			players_backup = JSON.parse(JSON.stringify(players));

			// remove empty players and empty words
			for (const player of players) {
				player.words = player.words.filter((word) => word.text);
				player.disallowed_words = player.words.map((word) => word.text);
			}

			players = players.filter((player) => player.name);
		} else {
			players = players_backup;
		}
	}

	function reset_game() {
		players = [];
	}

	function reset_scores() {
		for (const player of players) {
			for (const word of player.words) {
				word.correct = undefined;
			}
		}
		players = players;
	}

	function shuffle_words() {
		const playersCopy: IPlayer[] = shuffleArray(
			JSON.parse(JSON.stringify(players)).filter(
				(player: IPlayer) => player.name
			)
		);

		const allWords = shuffleArray(
			playersCopy.flatMap((player) =>
				player.words.filter((word) => word.text)
			)
		);

		if (allWords.length < playersCopy.length || playersCopy.length === 0) {
			toaster.error("Failed to shuffle :/ try adding more words");
			return;
		}

		for (const player of playersCopy) {
			player.words = [];
		}

		let playerIndex = 0;
		console.log(playersCopy);
		while (allWords.length) {
			const player = playersCopy[playerIndex];
			if (!tryToAddWord(player, allWords)) {
				toaster.alert("Sorry, couldn't quite find an arrangement :/");
				return;
			}

			playerIndex += 1;
			if (playerIndex >= playersCopy.length) {
				playerIndex = 0;
			}
		}

		toaster.notify("Yay! Done :)");
		players = playersCopy;
	}

	function tryToAddWord(player: IPlayer, allWords: IWord[]): boolean {
		// Dumb algo: try to push the next word onto the player. If we can move on. If we can't with any of these words then quit
		const wordsToReadd: IWord[] = [];
		while (allWords.length) {
			let word = allWords.pop();
			if (
				player.disallowed_words.findIndex((w) => w === word.text) === -1
			) {
				player.words.push(word);
				allWords.splice(0, 0, ...wordsToReadd);
				return true;
			} else {
				wordsToReadd.push(word);
			}
		}

		return false;
	}

	$: {
		if (
			!isPlaying &&
			(!players.length || players[players.length - 1].name)
		) {
			add_player();
		}
	}

	$: {
		window.localStorage.setItem(DATA_KEY, JSON.stringify(players));
	}

	$: {
		if (isPlaying) {
			let minAnswered = Infinity;
			let minIndex = -1;
			for (let i = 0; i < players.length; i++) {
				const player = players[i];
				const numAnswered = player.words.reduce(
					(total, word) =>
						(word.correct !== undefined ? 1 : 0) + total,
					0
				);

				if (
					numAnswered < player.words.length &&
					(numAnswered < minAnswered || minIndex === -1)
				) {
					minAnswered = numAnswered;
					minIndex = i;
				}
			}
			currentPlayerIndex = minIndex;
		}
	}
</script>

<div>
	<div class="pt-12 pb-12">
		<Button on:click={() => toggle_is_playing()}>
			{isPlaying ? "Back to input" : "Start the game"}
		</Button>
		{#if isPlaying}
			<Button on:click={() => shuffle_words()}>Shuffle words</Button>
			<Button on:click={() => reset_scores()}>Reset scores</Button>
		{:else}
			<Button on:click={() => reset_game()}>Clear game</Button>
		{/if}
	</div>
	{#each players as player, i}
		<Player
			{player}
			{isPlaying}
			isActive={isPlaying && currentPlayerIndex === i}
			on:delete={() => delete_player(player)}
			on:player_update={() => update_player(player)}
		/>
	{/each}
</div>

<style lang="scss">
</style>
