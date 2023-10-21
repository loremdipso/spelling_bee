<script lang="ts">
	import Button from "smelte/src/components/Button";
	import Player from "./Player.svelte";
	import type { IPlayer } from "interfaces";
	import { toaster } from "../common/Toast.svelte";
	import { shuffleArray } from "../common/misc";

	let isPlaying = false;

	function get_players_from_storage(): IPlayer[] {
		try {
			return JSON.parse(window.localStorage.getItem(DATA_KEY) || "");
		} catch {
			return [];
		}
	}

	const DATA_KEY = "spelling-bee-data";
	let players: IPlayer[] = get_players_from_storage();

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
			// remove empty players and empty words
			for (const player of players) {
				player.words = player.words.filter((word) => word.text);
				player.disallowed_words = player.words.map((word) => word.text);
			}

			players = players.filter((player) => player.name);
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
		const allWords = players.flatMap((players) =>
			players.words.filter((word) => word.text)
		);

		if (allWords.length < players.length || players.length === 0) {
			toaster.error("Failed to shuffle :/ try adding more words");
			return;
		}

		const words = shuffleArray(allWords);
		players = players.filter((player) => player.name);
		players = shuffleArray(players);

		for (const player of players) {
			player.words = [];
		}

		let playerIndex = 0;
		while (players.length && allWords.length) {
			const word = allWords.pop();
			players[playerIndex].words.push(word);
			playerIndex += 1;
			if (playerIndex >= players.length) {
				playerIndex = 0;
			}
		}

		players = players;
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
</script>

<div>
	<div>
		<Button on:click={() => toggle_is_playing()}>
			{isPlaying ? "Back to input" : "Start the game"}
		</Button>
		<Button on:click={() => shuffle_words()}>Shuffle words</Button>
		{#if isPlaying}
			<Button on:click={() => reset_scores()}>Reset scores</Button>
		{:else}
			<Button on:click={() => reset_game()}>Reset game</Button>
		{/if}
	</div>
	{#each players as player}
		<Player
			{player}
			{isPlaying}
			on:delete={() => delete_player(player)}
			on:player_update={() => update_player(player)}
		/>
	{/each}
</div>

<style lang="scss">
</style>
