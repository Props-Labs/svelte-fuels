<script lang="ts">
	import { connected, account, connect, disconnect, hasConnector } from '$lib/index.js';
</script>

<main>
	<h1>Svelte Fuels Demo</h1>
	{#if $hasConnector}
		{#if $connected}
			<p>Connected Account: {$account}</p>
			<button on:click={() => disconnect()}>Disconnect Wallet</button>
		{:else}
			<p>Not connected</p>
			<button on:click={() => connect()}>Connect Wallet</button>
		{/if}
	{:else}
		<p>No Wallet installed. Please install a Fuel Wallet to continue.</p>
	{/if}
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	button {
		background-color: #4CAF50;
		border: none;
		color: white;
		padding: 15px 32px;
		text-align: center;
		text-decoration: none;
		display: inline-block;
		font-size: 16px;
		margin: 4px 2px;
		cursor: pointer;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
