import { Classes } from "ui/Classes";
import Component from "ui/Component";
import Time from "utility/Time";
import Bound from "utility/decorator/Bound";

export enum TimestampClasses {
	Main = "timestamp",
}

// note: these components persist in memory forever
export default class Timestamp extends Component<HTMLElement, [time?: number, format?: "relative", options?: Time.RelativeOptions] | [time?: number, format?: "absolute", options?: Intl.DateTimeFormatOptions]> {

	public static override defaultType = "span";

	public time?: number;
	private mode?: "relative" | "absolute";
	private options?: Time.RelativeOptions | Intl.DateTimeFormatOptions;

	protected override onMake (time?: number, format: "relative" | "absolute" = "relative", options?: Time.RelativeOptions | Intl.DateTimeFormatOptions): void {
		this.classes.add(TimestampClasses.Main);


		this.setTime(time);
		this.setDisplayMode(format, options);
	}

	public setDisplayMode (mode: "relative", options?: Time.RelativeOptions): this;
	public setDisplayMode (mode: "absolute", options?: Intl.DateTimeFormatOptions): this;
	public setDisplayMode (mode: "relative" | "absolute", options?: Time.RelativeOptions | Intl.DateTimeFormatOptions): this;
	public setDisplayMode (mode: "relative" | "absolute", options?: Time.RelativeOptions | Intl.DateTimeFormatOptions) {
		this.mode = mode;
		this.options = options;

		if (!this.rendering)
			this.render();

		return this;
	}

	public setTime (time?: number) {
		this.time = time;
		this.classes.toggle(time === undefined, Classes.Hidden);
		if (time === undefined)
			return this.text.set("");

		if (!this.rendering)
			this.render();
		return this;
	}

	private rendering = false;
	@Bound
	private render () {
		this.rendering = true;
		this.text.set(Time[this.mode!]?.(this.time ?? 0, this.options));
		if (this.mode === "relative")
			window.setTimeout(this.render, 900); // less than 1 second so that we never miss a second
		else
			this.rendering = false;
	}
}
