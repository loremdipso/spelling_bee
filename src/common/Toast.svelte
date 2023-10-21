<script context="module">
	import { writable } from "svelte/store";

	function withColor(color, store) {
		return (message) =>
			store.update((u) => [
				...u,
				{
					message,
					ts: new Date(),
					color,
					toString() {
						return message;
					},
				},
			]);
	}

	function notificationQueue() {
		const toastStore = writable([]);

		return {
			subscribe: toastStore.subscribe,

			notify: withColor("gray", toastStore),
			error: withColor("error", toastStore),
			alert: withColor("alert", toastStore),

			remove: (i) =>
				toastStore.update((u) => {
					u.splice(i, 1);
					return u;
				}),
		};
	}

	export const toaster = notificationQueue();
</script>

<script>
	import Snackbar from "smelte/src/components/Snackbar";

	export let color = "alert";

	export let queue = toaster;
	let message;
	let item;
	let ts;

	$: {
		if (!item) {
			item = $queue[0];
		}

		if (typeof item === "string") {
			message = item;
		} else if (item) {
			message = item.toString();
			color = item.color;
			ts = item.ts;
		}
	}
</script>

<Snackbar
	value={ts}
	hash={ts}
	top
	{color}
	{...item}
	on:finish={() => {
		queue.remove($queue.indexOf(item));
		item = false;
	}}
>
	{message}
</Snackbar>
