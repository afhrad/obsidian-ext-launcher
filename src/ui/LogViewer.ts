import {type App, Modal, Setting} from "obsidian";
import {faCheckCircle, faWarning} from "@fortawesome/free-solid-svg-icons";
import Icon from "svelte-awesome/components/Icon.svelte";

export class LogViewer extends Modal {

	logContent: string;
	executionTime: string;
	isError: boolean;

	constructor(app: App, isError:boolean, executionTime:string, logContent: string ) {
		super(app);
		this.logContent = logContent;
		this.executionTime = executionTime;
		this.isError = isError;
		this.containerEl.addClass("addModal");

		this.open();
		this.display();
	}

	protected display() {
		this.contentEl.empty();
		this.containerEl.addClass("templateChoiceBuilder");
		this.addTitle();
		this.addDebugInformation();
	}
	protected addTitle(): void {
		const headerEl: HTMLDivElement = this.contentEl.createEl("div", {
			cls: "logHeader",
		});

		const iconContainer = document.createElement("span");
		headerEl.append(iconContainer);

		if (this.isError) {
			new Icon({
				target: iconContainer,
				props: {
					data: faWarning,
					class: "header-icon"
				}
			});
		} else {
			new Icon({
				target: iconContainer,
				props: {
					data: faCheckCircle,
					class: "header-icon"
				}
			});
		}

		const titleText = document.createElement("span");
		titleText.textContent = "External Launcher Log Viewer (" + this.executionTime + ")";
		headerEl.append(titleText);
	}

	private addDebugInformation(): void {
		new Setting(this.contentEl)
			.addTextArea((cb) => {
				cb.inputEl.addClass("argument-full-width", "monospaced-content");
				cb.setValue(this.logContent);
				cb.inputEl.style.height = "50vh";
			})
			.settingEl.addClass("full-width-setting");
	}
}
