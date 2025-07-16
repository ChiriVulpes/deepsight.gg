import crypto from "crypto";
import fs from "fs-extra";
import path from "path";

namespace Hash {

	export async function file (filepath: string) {
		const stream = fs.createReadStream(filepath);
		const hash = crypto.createHash("sha1");
		hash.setEncoding("hex");

		return new Promise<string>(resolve => {
			stream.on("end", function () {
				hash.end();
				resolve(hash.read() as string);
			});
			stream.pipe(hash);
		});
	}

	const hashes: Record<string, string> = {};
	export async function fileChanged (filepath: string) {
		const resolvedPath = path.resolve(filepath);
		const hash = await file(resolvedPath);
		if (hash === hashes[resolvedPath])
			return false;

		hashes[resolvedPath] = hash;
		return true;
	}
}

export default Hash;
