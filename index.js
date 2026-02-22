#!/usr/bin/env node

import { colour, typeColour, COLOUR, str2bool } from "./src/utils.js";

import { execSync, spawnSync, spawn } from "child_process";
import xdg from "@folder/xdg";
import { platform, homedir } from "os";
import Database from "better-sqlite3";
import yargs from "yargs";
import fs from "fs";
import which from "which";


yargs().help(false);
var { argv } = yargs(process.argv.slice(2));
if (!argv)
	argv = {};


import * as WhatsApp from "./src/api/whatsapp.js";
import * as Telegram from "./src/api/telegram.js";


const __dirname = import.meta.dirname;
const {
	API_TELEGRAM_TOKEN,
	API_TELEGRAM_ID,
	API_TELEGRAM_HASH,
	DEFAULT_INFO_FORMAT,
	HOME,
	DEFAULT_API,
	DEFAULT_COLOUR,
	AUTOSAVE,
	AUTOSAVE_PHOTO,
	EDITOR,
	PHONE_TEST
} = process.env;

const prog = "nyx-lookup";
const editor = EDITOR || "vim";

const str2yn = s => str2bool(s) ? "yes" : "no";
const formatPhone = str => (str === "string" ? str.replace(/ |-|\\|\/|\.|^(\+*)(0*)/g, '') : str + "")

async function main() {
	try {
		const { cache } = xdg();
		const pathSave = `${homedir()}/${prog}`;
		const pathToken = `${cache}/${prog}/auth`;

		// console.log(argv);
		if (process.argv.length < 3 || argv.h || argv.help || argv["?"]) {
			console.log(`\x1b[0;4mUsage:\x1b[0m \x1b[36m${prog}\x1b[0m [options] \x1b[1mphone\x1b[0m

  -p --photo        Download photo into '${pathSave}'
  -s --[no-]save    Save user info and photo (autosave: \x1b[1m${str2yn(AUTOSAVE)}\x1b[0m)
  -f --format={ text | json }
                    Define output format (default: \x1b[1m${!DEFAULT_INFO_FORMAT || DEFAULT_INFO_FORMAT === "json" ? "json" : "text"}\x1b[0m)
  -c --[no-]colour  No colour (only for 'text' format) (default \x1b[1m${str2yn(DEFAULT_COLOUR)}\x1b[0m)
  -e --env          Edit env file (default editor: \x1b[1m${editor}\x1b[0m)
     --api={ wa | tg | all }
                    API service to use (default: \x1b[1m${DEFAULT_API || "all"}\x1b[0m)
     --force        Force query, do not use cached data.
     --db           Access database cache.
     --open-photos[=phone]
                    Access cached photos.

     --non-interactive
                    Will not ask to login if no session was found
     --test         Test phone from env. variable PHONE_TEST
                    Non-interactive is automatically true
                    
  -h --help        Show this help
  -v --version     Show version
  
  \x1b[4mStatus:\x1b[0m
    WhatsApp: ${fs.existsSync(pathToken) ? "\x1b[1;32m\u2714\x1b[0m" : "\x1b[1;31m\u2a2f\x1b[0m"}
    Telegram: ${/^[-A-Za-z0-9+/]{32,}={0,3}$/.test(API_TELEGRAM_TOKEN) ? "\x1b[1;32m\u2714\x1b[0m" : "\x1b[1;31m\u2a2f\x1b[0m"}`)
			return 0;
		}
		else if (argv.v || argv.version) {
			const current = require('./package.json').version;
			console.log(current);
			const latest = execSync(`npm view ${prog} version`, { encoding: 'utf-8' }).trim();
			console.log(latest === current ? `${colour("1;32")}\u2714 Latest\x1b[0m` : `${colour("1;31")}\u2a2f Latest: ${latest}\x1b[0m`);
		}
		else if (argv.e || argv.env) {
			if (!fs.existsSync(`${__dirname}/.env`) || !fs.readFileSync(__dirname + "/.env", 'utf-8').trim().length)
				fs.copyFileSync(__dirname + "/.env.txt", __dirname + "/.env");
			spawnSync(editor, [`${__dirname}/.env`], { stdio: 'inherit' });
		}
		else if (argv.db) {
			if (!fs.existsSync(pathSave + '/saved.db') || !fs.readFileSync(__dirname + "/.env", 'utf-8').trim().length)
				console.error("Error: Database does not exist.");
			else if (!which.sync('sqlite3', { nothrow: true }))
				console.error("Error: sqlite3 not installed.");
			else
				spawnSync("sqlite3", [pathSave + '/saved.db'], { stdio: 'inherit' });
		}
		else if (argv.openPhotos) {
			var cmd = "";
			switch (platform().toLowerCase().replace(/[0-9]/g, '')) {
				case `win`:
					cmd = `explorer`;
					break;
				case `linux`:
					cmd = `xdg-open`;
					break;
				case `macos`:
					cmd = `open`;
					break;
			}
			const phone = argv._.length !== 0 || argv.openPhotos !== true ? "/"+formatPhone(argv._[0] || argv.openPhotos) : "";
			const pathPhone = `${pathSave}${phone}`;
			spawn(cmd, [pathPhone]);
		}
		// They shall be removed from their apps
		// else if (argv.clean) {
		// 	// fs.rmSync(pathToken, { recursive: true, force: true });
		// 	// Should we remove telegram token when cleaning ?
		// 	// fs.writeFileSync(
		// 	// 	__dirname + "/.env",
		// 	// 	fs.readFileSync(__dirname + "/.env", 'utf-8')
		// 	// 		.split("\n")
		// 	// 		.map(v => v.replace(/API_TELEGRAM_TOKEN=?.*/g, "API_TELEGRAM_TOKEN="))
		// 	// 		.join("\n"),
		// 	// 	'utf-8'
		// 	// );
		// }
		else if (argv.test !== true && (!argv._ || argv._?.length === 0))
			throw new Error("No phone number specified");
		else {
			if (argv.test === true) {
				if (!PHONE_TEST && argv._.length !== 1)
					throw new Error("No test phone specified in environment variable PHONE_TEST and no phone number passed in argument");
				argv.nonInteractive = true;
				// Is WhatsApp possible ?
				argv.api = "tg";
			}
			if (argv.api === undefined)
				argv.api = (DEFAULT_API || "all").toLowerCase();
			// console.log(argv.api);

			const phone = formatPhone(argv.test === true && PHONE_TEST ? PHONE_TEST : (argv._[0] + ""));
			const pathPhone = `${pathSave}/${phone}`;

			fs.mkdirSync(pathSave, { recursive: true });
			const db = new Database(pathSave + '/saved.db');
			db.pragma('journal_mode = WAL');

			if (!str2bool(argv.force)) {
				try {
					WhatsApp.create_table(db);
					Telegram.create_table(db);

					let whatsapp = {};
					let telegram = {};
					if (["all", "wa"].includes(argv.api)) {
						db.prepare("UPDATE whatsapp SET datetimeAccessed = time('now') WHERE rawPhone = ?").run(phone);
						whatsapp = db.prepare("SELECT * FROM whatsapp WHERE rawPhone = ?").bind(phone).all();
						if (whatsapp.length > 1)
							throw new Error("Multiple record for this phone number. Debug database with --db");
						whatsapp = whatsapp[0] || {};
					}
					if (["all", "tg"].includes(argv.api)) {
						db.prepare("UPDATE telegram SET datetimeAccessed = time('now') WHERE phone = ?").run(phone);
						telegram = db.prepare("SELECT * FROM telegram WHERE phone = ?").bind(phone).all();
						if (telegram.length > 1)
							throw new Error("Multiple record for this phone number. Debug database with --db");
						telegram = telegram[0] || {};
					}

					if (whatsapp || telegram) {
						const last_activity = Math.max(telegram.lastActivity || 0, whatsapp.lastActivity || 0);
						// console.log(process.env.DEFAULT_COLOUR)
						// console.log(telegram);
						console.log(`  Type:          ${typeColour(whatsapp.type || telegram.className)}${whatsapp.type || telegram.className || ""}\x1b[0m
  Bot:           ${typeColour(telegram.bot == 1)}${telegram.bot || false}\x1b[0m
  Verified:      ${typeColour(telegram.verified == 1)}${telegram.verified || false}\x1b[0m
  Restricted:    ${typeColour(telegram.restricted == 1)}${telegram.restricted || false}\x1b[0m
  Premium:       ${typeColour(telegram.premium == 1)}${telegram.premium || false}\x1b[0m
  Support:       ${typeColour(telegram.support == 1)}${telegram.support || false}\x1b[0m
  Scam:          ${typeColour(telegram.scam == 1)}${telegram.scam || false}\x1b[0m
  Fake:          ${typeColour(telegram.fake == 1)}${telegram.fake || false}\x1b[0m

  Name:          ${colour(COLOUR.NAME)}${whatsapp.name || ""}\x1b[0m
  First name:    ${colour(COLOUR.NAME)}${telegram.firstName || ""}\x1b[0m
  Last name:     ${colour(COLOUR.NAME)}${telegram.lastName || ""}\x1b[0m
  Pushname:      ${colour(COLOUR.NAME)}${whatsapp.pushname || ""}\x1b[0m
  Username:      ${colour(COLOUR.NAME)}${telegram.username || ""}\x1b[0m

  Picture:       ${fs.readdirSync(pathPhone).filter(v => !v.endsWith(".txt") && !v.endsWith(".json")).length} saved
  Phone:         ${typeColour(whatsapp.rawPhone)}${whatsapp.rawPhone || ""}\x1b[0m
  Formatted:     ${typeColour(whatsapp.formattedPhone)}${whatsapp.formattedPhone || ""}\x1b[0m
  About:         ${colour("33")}${whatsapp.about || ""}\x1b[0m
  Emoji status:  ${colour("33")}${telegram.emojiStatus || ""}\x1b[0m
  Color:         ${colour("32")}${telegram.color || ""}\x1b[0m
  Profile color: ${colour("32")}${telegram.profileColor || ""}\x1b[0m
  Language:      ${colour("32")}${telegram.langCode || ""}\x1b[0m
  Last activity: ${typeof last_activity === "number" && last_activity != 0 ? colour("35") + new Date(last_activity * 1000) : "\x1b[3mUnknown"}\x1b[0m
`);
						return 0;
					}
				}
				catch (err) {
					if (!err.message.toLowerCase().includes("not such table")) {
						console.error(err);
					}
					return 1;
				}
			}
			// return 0;

			if (argv.s)
				argv.save = true;
			else if (argv.save === undefined)
				argv.save = str2bool(AUTOSAVE);

			if (argv.save)
				argv.photo = true;

			// if (argv.p)
			// 	argv.photo = true;
			// else if (argv.photo === undefined)
			// 	argv.photo = str2bool(AUTOSAVE_PHOTO);

			if (argv.save !== false || argv.p || argv.photo) {
				argv.photo = true;
				fs.mkdirSync(pathPhone, { recursive: true });
			}

			const format = (() => {
				if (typeof argv.format === "string")
					return argv.format.toLowerCase();
				if (typeof argv.f === "string")
					return argv.f.toLowerCase();
				return !DEFAULT_INFO_FORMAT || DEFAULT_INFO_FORMAT === "json" ? "json" : "text";
			})();

			const dataJson = {
				whatsapp: undefined,
				telegram: undefined
			};
			let dataText = "";

			const printText = text => {
				console.log(text);
				dataText += text.replace(/\x1b[[0-9;]+m/g, "") + "\n";
			}

			const context = {
				db,
				argv,
				pathPhone,
				pathToken,
				pathSave,
				phone,
				format,
				__dirname,
				printText
			};

			if (["all", "wa"].includes(argv.api)) {
				// spinner.succeed("");
				dataJson.whatsapp = await WhatsApp.Api(context);
			}

			if (["all", "tg"].includes(argv.api)) {
				// spinner.succeed("");
				dataJson.telegram = await Telegram.Api(context);
			}

			// console.log("${colour("1;32")}Done.\x1b[0m");
			if (format === "json")
				console.log(JSON.stringify(dataJson));
		}
		return 0;
	}
	catch (e) {
		console.log(`Error: ${e?.message}`);
		// spinner.fail("");
		// if (argv.save === true)
		// 	fs.writeFileSync(`${phone}/info.${format === "text" ? "txt" : "json"}`, format === "text" ? dataText : dataJson);
		return 1;
	}
}

main()
	.then(status => process.exit(status))
	.catch(() => process.exit(1))