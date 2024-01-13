import Component from "ui/Component";
import Async from "utility/Async";

namespace Fonts {

	const TEST_STRING = "mmmmm";
	const FONTS = {
		"neue-haas-grotesk": ["Neue Haas Grotesk Display Pro", "Neue Haas Grotesk Display", "Neue Haas Grotesk"],
	};

	export async function check () {
		const monospaceSpan = Component.create("span")
			.style.set("font-family", "monospace")
			.style.set("opacity", "0")
			.style.set("user-select", "none")
			.style.set("pointer-events", "none")
			.style.set("font-size", "48px")
			.style.set("position", "absolute")
			.style.set("top", "0")
			.style.set("left", "0")
			.text.set(TEST_STRING)
			.appendTo(document.body);

		for (const [id, variants] of Object.entries(FONTS)) {
			const variantSpans = variants.map(variant => [variant, Component.create("span")
				.style.set("font-family", `"${variant}", monospace`)
				.style.set("opacity", "0")
				.style.set("user-select", "none")
				.style.set("pointer-events", "none")
				.style.set("font-size", "48px")
				.style.set("position", "absolute")
				.style.set("top", "0")
				.style.set("left", "0")
				.text.set(TEST_STRING)
				.appendTo(document.body)] as const);

			await Async.sleep(100);

			for (const [variant, span] of variantSpans) {
				if (span.element.clientWidth !== monospaceSpan.element.clientWidth) {
					Component.get(document.documentElement)
						.style.set(`--font-${id}`, `"${variant}"`)
						.classes.add(`has-font-${id}`);
					break;
				}
			}

			for (const [, span] of variantSpans) {
				span.remove();
			}
		}

		monospaceSpan.remove();
	}
}

export default Fonts;
