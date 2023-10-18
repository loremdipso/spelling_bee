<script lang="ts">
	import Button from "smelte/src/components/Button";
	import Player from "./Player.svelte";
	import type { IPlayer } from "interfaces";

	let players: IPlayer[] = [
		{
			name: "michael",
			words: [{ text: "apple" }],
		},
		{
			name: "ian",
			words: [{ text: "banana" }],
		},
	];

	function delete_player(playerToDelete: IPlayer) {
		players = players.filter((player) => player !== playerToDelete);
	}

	function update_player(player: IPlayer) {
		// TODO: update scores, I guess?
	}

	function add_player() {
		players.push({ name: "", words: [] });
		players = players;
	}
</script>

<div>
	{#each players as player}
		<Player
			{player}
			on:delete={() => delete_player(player)}
			on:player_update={() => update_player(player)}
		/>
	{/each}

	<div
		class="m-2 p-2 bg-white dark:bg-gray-600 duration-200 rounded ease-in shadow-sm hover:shadow"
	>
		<Button
			color="blue"
			remove="p-4"
			icon="plus"
			title="Add player"
			on:click={() => add_player()}
		>
			Add player
		</Button>
	</div>
</div>

<style lang="scss">
</style>
