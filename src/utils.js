const __dirname = import.meta.dirname;

import dotenv from "dotenv";
dotenv.config({
	path: __dirname + '/../.env',
	quiet: true
})


import path from "path";
import crypto from "crypto";
import yargs from "yargs";
import fs from "fs";

// export function download(url, dest, cb) {
// 	const file = fs.createWriteStream(dest);

// 	https.get(url, (response) => {
// 		response.pipe(file);
// 		file.on('finish', () => {
// 			file.close(cb)
// 		});
// 	}).on('error', (err) => {
// 		fs.unlink(dest, cb(err));
// 	});
// }

yargs().help(false);
var { argv } = yargs(process.argv.slice(2));
if (!argv)
	argv = {};

export const str2bool = s => /^true|yes|1$/i.test(s);
const displayColour =  argv.colour !== undefined ? argv.colour : str2bool(process.env.DEFAULT_COLOUR);
export const colour = (...args) => !displayColour ? "" : "\x1b[" + args.join(";") + "m";

export const COLOUR = {
	NAME: "34",
	USERNAME: "35"
};

export const typeColour = v => {
	if (!displayColour)
		return "";
	switch (typeof v) {
		case "boolean":
			return `\x1b[${v === true ? "32" : "31"}m`;
		case "number":
		case "bigint":
		case "object":
			if (v === null)
				return "\x1b[31m";
			return "\x1b[36m";
		case "string":
			const b = v.toLowerCase();
			if (b === "true" || b === "false")
				return `\x1b[${v === "true" ? "32" : "31"}m`;
			else if (v.startsWith("+"))
				return "\x1b[32m";
			else if (/^\d+$/.test(v))
				return "\x1b[36m";
			return "\x1b[33m";
		default:
			return "";
	}
}

function colourAuto(out) {
	const __auto = v => {
		v = v.slice(1);
		return `:${typeColour(v.trim())}${v}\x1b[0m`;
	}
	return out
		.replace(/(\r|\n)(\w+:)/g, "\n\x1b[1;4m$2\x1b[0m")
		.replace(/name:(\s+)([\w ]+)(\r|\n)/gi, `name:$1\x1b[${COLOUR.NAME}m$2\x1b[0m\n`)
		.replace(/activity:(\s+)([\w ()+:]+)(\r|\n)/gi, `activity:$1\x1b[35m$2\x1b[0m\n`)
		.replace(/:(\s+)([\w ()+]+)(\r|\n)/g, __auto)
}


const getFileHash = filePath => (
	new Promise((resolve, reject) => {
		const hash = crypto.createHash('sha256');
		const stream = fs.createReadStream(filePath);
		stream.on('data', chunk => hash.update(chunk));
		stream.on('end', () => resolve(hash.digest('hex')));
		stream.on('error', reject);
	})
);

export async function removeDuplicateFiles(folder) {
	const files = fs.readdirSync(folder);
	const fileHashes = {};

	for (const file of files) {
		const fullPath = path.join(folder, file);
		const stats = fs.statSync(fullPath);

		if (!stats.isFile()) continue;

		const hash = await getFileHash(fullPath);

		if (fileHashes[hash]) {
			const existing = fileHashes[hash];

			// console.log(hash)
			// console.log(fileHashes);

			// Compare modification times — keep the oldest
			// if (existing) {
			if (stats.mtimeMs < existing.mtimeMs) {
				fs.unlinkSync(existing.path);
				// fileHashes[hash] = { path: fullPath, mtimeMs: stats.mtimeMs };
			} else {
				fs.unlinkSync(fullPath);
			}
			// }
		} else {
			fileHashes[hash] = { path: fullPath, mtimeMs: stats.mtimeMs };
		}
	}
}