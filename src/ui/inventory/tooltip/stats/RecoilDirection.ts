import Component from "ui/Component";

/**
 * **NOTE:** The maths in this file is pulled from the DIM source code (https://github.com/DestinyItemManager/DIM/blob/59c3b0c81c5f86d73e3ffb986143f73f5f3c6ee4/src/app/item-popup/RecoilStat.tsx), 
 * and therefore falls under the MIT license in that project (https://github.com/DestinyItemManager/DIM/blob/43709b9128832fd26ec5832cb4d43d628a0c4aaf/LICENSE.md):
 * 
 * MIT License
 * 
 * Copyright (c) 2018 Destiny Item Manager
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * A value from 100 to -100 where positive is right and negative is left and zero is straight up
 * See https://imgur.com/LKwWUNV
 */
function recoilDirection (value: number) {
	return Math.sin((value + 5) * (Math.PI / 10)) * (100 - value);
}

/**
 * A value from 0 to 100 describing how straight up and down the recoil is, for sorting
 */
export function recoilValue (value: number) {
	const deviation = Math.abs(recoilDirection(value));
	return 100 - deviation + value / 100000;
}

// How much to bias the direction towards the center - at 1.0 this would mean recoil would swing ±90°
const verticalScale = 0.8;
// The maximum angle of the pie, where zero recoil is the widest and 100 recoil is the narrowest
const maxSpread = 180; // degrees

export default function (value: number) {
	const direction = recoilDirection(value) * verticalScale * (Math.PI / 180); // Convert to radians
	const x = Math.sin(direction);
	const y = Math.cos(direction);

	const spread =
		// Higher value means less spread
		((100 - value) / 100) *
		// scaled by the spread factor (halved since we expand to either side)
		(maxSpread / 2) *
		// in radians
		(Math.PI / 180) *
		// flipped for negative
		Math.sign(direction);

	const xSpreadMore = Math.sin(direction + spread);
	const ySpreadMore = Math.cos(direction + spread);
	const xSpreadLess = Math.sin(direction - spread);
	const ySpreadLess = Math.cos(direction - spread);

	/**
	 * DIM-licensed code ends here. But credit where credit is due, the following SVG generation is still based on
	 * the SVG generation in the same RecoilStat.tsx file.
	 */

	const svg = Component.create("svg")
		.attributes.set("viewBox", "0 0 2 1")
		.append(Component.create("circle")
			.attributes.set("r", "1")
			.attributes.set("cx", "1")
			.attributes.set("cy", "1"));

	if (value >= 95)
		Component.create("line")
			.attributes.set("x1", `${1 - x}`)
			.attributes.set("y1", `${1 + y}`)
			.attributes.set("x2", `${1 + x}`)
			.attributes.set("y2", `${1 - y}`)
			.appendTo(svg);

	else
		Component.create("path")
			.attributes.set("d", `
				M 1,1${/* move to bottom middle */""}
				L ${1 + xSpreadMore},${1 - ySpreadMore}${/* draw a line to the "more" side of the spread */""}
				A${/* begin drawing an arc */""}
					1,1${/* with the origin in the bottom middle */""}
					0${/* angled at 0deg (relative to x axis) */""}
					0,${direction < 0 ? "1" : "0"}${/* 1 = clockwise, 0 = anticlockwise */""}
					${1 + xSpreadLess},${1 - ySpreadLess}${/* end the arc at the "less" side of the spread */""}
				Z${/* close line to starting point (bottom middle) */""}
			`)
			.appendTo(svg);

	return svg;
}