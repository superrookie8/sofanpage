"use client";

import {
	useCallback,
	useSyncExternalStore,
	type Dispatch,
	type SetStateAction,
} from "react";

interface GlobalState<T> {
	key: string;
	defaultValue: T;
	getSnapshot: () => T;
	set: Dispatch<SetStateAction<T>>;
	subscribe: (listener: () => void) => () => void;
}

const states = new Map<string, GlobalState<unknown>>();

export function atom<T>({ key, default: defaultValue }: { key: string; default: T }) {
	const existing = states.get(key) as GlobalState<T> | undefined;
	if (existing) return existing;

	let value = defaultValue;
	const listeners = new Set<() => void>();
	const state: GlobalState<T> = {
		key,
		defaultValue,
		getSnapshot: () => value,
		set: (next) => {
			value = typeof next === "function"
				? (next as (previous: T) => T)(value)
				: next;
			listeners.forEach((listener) => listener());
		},
		subscribe: (listener) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
	};
	states.set(key, state as GlobalState<unknown>);
	return state;
}

export function useRecoilValue<T>(state: GlobalState<T>): T {
	return useSyncExternalStore(
		state.subscribe,
		state.getSnapshot,
		() => state.defaultValue
	);
}

export function useSetRecoilState<T>(state: GlobalState<T>): Dispatch<SetStateAction<T>> {
	return useCallback((next) => state.set(next), [state]);
}

export function useRecoilState<T>(state: GlobalState<T>) {
	return [useRecoilValue(state), useSetRecoilState(state)] as const;
}
