export { default as WalletProvider } from './WalletProvider.svelte';

import { Fuel, BN, Account, FuelConnector } from 'fuels';
import { FuelWalletConnector } from '@fuels/connectors';

export * from 'fuels';

import { derived, writable } from 'svelte/store';

let fuel: Fuel;

type WalletState = {
	connected: boolean;
	currentAccount?: string;
	hasConnector?: boolean;
	wallet?: Account;
	walletBalance?: BN;
	fuel?: Fuel;
};

export const walletStore = writable<WalletState>({
	connected: false
});

export const loading = writable(true);

export const connected = derived(walletStore, ($walletStore) => {
	return $walletStore.connected;
});

export const account = derived(walletStore, ($walletStore) => {
	return $walletStore.currentAccount;
});

export const wallet = derived(walletStore, ($walletStore) => {
	return $walletStore.wallet;
});

export const fuelStore = derived(walletStore, ($walletStore) => {
	return $walletStore.fuel;
});

export const hasConnector = derived(walletStore, ($walletStore) => {
	return $walletStore.hasConnector || false;
});

export type WalletStoreOptions = {
	connectors?: Array<FuelConnector>;
}

export const createWalletStore = (options: WalletStoreOptions) => {

	fuel = new Fuel({
		connectors: [new FuelWalletConnector(), ...(options.connectors || [])]
	});

	const handleConnection = async () => {
		console.log('handleConnection');
		const hasConnector = await fuel?.hasConnector();
		if (!hasConnector) {
			console.error('svelte-fuels: No connector found. Please provide a connector and install the wallet.');
			return;
		}
		const connected = await fuel?.isConnected();

		console.log('connected', connected);

		let currentAccount: string | null = null;
		let wallet: Account | undefined = undefined;

		if (connected) {
			try {
				currentAccount = await fuel?.currentAccount();
				console.log('currentAccount', currentAccount);
				wallet = await fuel?.getWallet(currentAccount as string);
			} catch (e) {
				console.error(e);
				fuel?.disconnect();
				fuel = new Fuel({
					connectors: [new FuelWalletConnector(), ...(options.connectors || [])]
				});
				handleConnection();
			}
		}

		console.log('wallet', wallet);

		walletStore.update((state) => {
			state.connected = connected || false;
			state.currentAccount = currentAccount || undefined;
			state.hasConnector = hasConnector;
			state.wallet = wallet || undefined;
			state.fuel = fuel;

			return state;
		});
		loading.set(false);
	};

	fuel?.on(fuel.events.connection, handleConnection);
    fuel?.on(fuel.events.accounts, handleConnection);
    fuel?.on(fuel.events.currentAccount, handleConnection);
    fuel?.on(fuel.events.currentNetwork, handleConnection);
    fuel?.on(fuel.events.networks, handleConnection);

	handleConnection();
};

export const connect = async (connectorName?: string) => {
	try {
		console.log('connect', connectorName);
		const success = await fuel?.selectConnector(connectorName || 'Fuel Wallet');
		console.log('success', success);
		console.log('fuel?.connect()');
		await fuel?.connect();
	} catch (error) {
		console.error('Failed to connect:', error);
		throw error;
	}
};

export const disconnect = async (connectorName?: string) => {
    try {
		fuel?.selectConnector(connectorName || 'Fuel Wallet');
        await fuel?.disconnect();
    } catch (error) {
        console.error('Failed to disconnect:', error);
        throw error;
    }
};
