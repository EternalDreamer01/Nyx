import config from "../../config.json" assert { type: "json" };


export const TimedPromise = (name, func) => (
	new Promise(async resolve => {
		const timer = setTimeout(() => {
			console.log(`\x1b[1;31m❌ ${name}\x1b[0m Could not to log in within time limit (${config.timeout / 1000}s)`);
			resolve(null);
		}, config.timeout);
		func(result => {
			clearTimeout(timer);
			console.log(`\x1b[1;32m✔ ${name}\x1b[0m`);
			resolve(result);
		});
	})
);