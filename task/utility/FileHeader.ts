import fs from "fs";

namespace FileHeader {

	export function readBytes (filePath: string, bytesToRead: number): Promise<string> {
		let firstChunk = "";
		return new Promise((resolve, reject) => {
			const stream = fs.createReadStream(filePath, {
				encoding: "utf8",
				start: 0,
				end: bytesToRead - 1,
			});
			stream.on("data", (chunk) => (firstChunk += chunk.toString("utf8")));
			stream.on("end", () => resolve(firstChunk));
			stream.on("error", reject);
		});
	}

	export function startsWith (filePath: string, expected: string): Promise<boolean> {
		return new Promise((resolve, reject) => {
			let contents = "";
			const stream = fs.createReadStream(filePath, { encoding: "utf8" });
			stream.on("data", (chunk) => {
				contents += chunk.toString("utf8");
				contents = contents.trimStart();
				if (contents.length > expected.length) {
					stream.destroy();
					resolve(matches());
				}
			});
			stream.on("end", () => resolve(matches()));
			stream.on("error", reject);

			function matches () {
				return contents.trimStart().startsWith(expected);
			}
		});
	}
}

export default FileHeader;
