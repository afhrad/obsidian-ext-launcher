import type {IScript, ObsidianData} from "./IScript";

export interface IScriptExecutor {
	execute(script: IScript): Promise<void>;
	obsidianData: ObsidianData;
}
