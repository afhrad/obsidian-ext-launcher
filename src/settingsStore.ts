import { createStore } from "zustand/vanilla";
import type {IScriptLauncherSettings} from "./SettingsTab";
import { DEFAULT_SETTINGS } from "./SettingsTab";
import {Script} from "./Script";

type SettingsState = IScriptLauncherSettings;

export const settingsStore = (() => {
	const useSettingsStore = createStore<SettingsState>((_set, _get) => ({
		...structuredClone(DEFAULT_SETTINGS),
	}));

	const { getState, setState, subscribe } = useSettingsStore;

	return {
		getState,
		setState,
		subscribe,
		setScript: (scriptId: Script["id"], script: Script) => {
			setState((state) => {
				const scriptIdx = state.scripts.findIndex((m) => m.id === scriptId);
				if (scriptIdx === -1) {
					throw new Error("Script not found");
				}

				const newState = {
					...state,
					scripts: [...state.scripts],
				};

				newState.scripts[scriptIdx] = script;

				return newState;
			});
		},
		createScript: (name: string) => {
			if (name === "" || getState().scripts.some((m) => m.name === name)) {
				throw new Error("Invalid script name");
			}

			const script = new Script(name);
			// @ts-ignore
			setState((state) => ({
				...state,
				scripts: [...state.scripts, script],
			}));

			return script;
		},
		getScript: (scriptId: Script["id"]) => {
			return getState().scripts.find((m) => m.id === scriptId);
		},
	};
})();
