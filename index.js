#!/usr/bin/env node

require('dotenv').config({ path: __dirname + '/.env' })

const { Api: TelegramApi, TelegramClient, Logger: TelegramLogger } = require("telegram");
const { StringSession } = require("telegram/sessions/index.js");
const input = require("input");
const WhatsApp = require("whatsapp-web.js");
const QRCcode = require("qrcode-terminal");
const fs = require('fs');
const request = require('request');
const { execSync, spawnSync } = require('child_process');
const xdg = require('@folder/xdg');
const homedir = require('os').homedir();

const yargs = require('yargs');
yargs().help(false);
var { argv } = yargs(process.argv.slice(2));
if (!argv)
	argv = {};

const Telegram = {
	photo: {
		get: async function (client, userList) {
			for (let i = 0; i < userList.length && i < 10; ++i) {
				userList[i].photo = await client.downloadProfilePhoto(userList[i].id, {
					isBig: true
				});
			}
			return userList;
		},
		isAvailable: (buf) => {
			if (Buffer.isBuffer(buf))
				return buf.byteLength !== 0;
			else if (typeof buf === "string")
				return buf.length !== 0;
			return false;
		}
	}
}

const download = (url, dest, cb) => {
	const file = fs.createWriteStream(dest);
	const sendReq = request.get(url);

	// verify response code
	sendReq.on('response', (response) => {
		if (response.statusCode !== 200) {
			return cb('Response status was ' + response.statusCode);
		}
		sendReq.pipe(file);
	});

	// close() is async, call cb after close completes
	file.on('finish', () => file.close(cb));

	// check for request errors
	sendReq.on('error', (err) => {
		fs.unlink(dest, () => cb(err)); // delete the (partial) file and then return the error
	});

	file.on('error', (err) => { // Handle errors
		fs.unlink(dest, () => cb(err)); // delete the (partial) file and then return the error
	});
};

const {
	API_TELEGRAM_TOKEN,
	API_TELEGRAM_ID,
	API_TELEGRAM_HASH,
	DEFAULT_INFO_FORMAT,
	HOME,
	AUTOSAVE,
	EDITOR,
	PHONE_TEST
} = process.env;

const prog = "nyx-lookup";
const editor = EDITOR || "vim";

const displayColour = argv.colour !== false;
const colour = (...args) => !displayColour ? "" : "\x1b[" + args.join(";") + "m";

const typeColour = v => {
	if (!displayColour)
		return "";
	switch (typeof v) {
		case "boolean":
			return `\x1b[${v === true ? "32" : "31"}m`;
		case "number":
		case "bigint":
		case "object":
			return "\x1b[36m";
		case "string":
			if (v.startsWith("+"))
				return "\x1b[32m";
			else if (/^\d+$/.test(v))
				return "\x1b[36m";
			return "\x1b[33m";
		default:
			return "";
	}
}

const NAME_COLOUR = "34";
const USERNAME_COLOUR = "35";

const formatPhone = str => (str === "string" ? str.replace(/ |-|\\|\/|\.|^(\+*)(0*)/g, '') : str + "")

async function main() {
	try {
		const { cache } = xdg();
		const pathSave = `${homedir}/${prog}`;
		const pathToken = `${cache}/${prog}/auth`;

		// console.log(argv);
		if (process.argv.length < 3 || argv.h || argv.help || argv["?"]) {
			console.log(`\x1b[0;4mUsage:\x1b[0m \x1b[36m${prog}\x1b[0m [options] \x1b[1mphone\x1b[0m

  -p --photo        Download photo
  -s --[no-]save    Save all user data (implies photo) into '${pathSave}' (autosave: \x1b[1m${/^true|yes$/i.test(AUTOSAVE) ? "yes" : "no"}\x1b[0m)
  -f --format=FMT   Define output format (default: \x1b[1m${!DEFAULT_INFO_FORMAT || DEFAULT_INFO_FORMAT === "json" ? "json" : "text"}\x1b[0m)
                    Available formats: 'text', 'json'
  -c --[no-]colour  No colour (only usable in 'text' format for stdout)
  -e --env          Edit env file (default editor: \x1b[1m${editor}\x1b[0m)
     --clean        Clean up sessions (simple unlink/edit)
     --non-interactive
                    Will not ask to login if no session was found

     --test         Test phone from env. variable PHONE_TEST
  
  -h  --help        Show this help
  -v  --version     Show version
  
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
		else if (argv.clean) {
			fs.rmSync(pathToken, { recursive: true, force: true });
			fs.writeFileSync(
				__dirname + "/.env",
				fs.readFileSync(__dirname + "/.env", 'utf-8')
					.split("\n")
					.map(v => v.replace(/API_TELEGRAM_TOKEN=?.*/g, "API_TELEGRAM_TOKEN="))
					.join("\n"),
				'utf-8'
			);
		}
		else if (argv.test !== true && (!argv._ || argv._?.length === 0))
			throw new Error("No phone number specified");
		else {
			if (argv.test === true && !PHONE_TEST)
				throw new Error("No test phone specified in environment variable PHONE_TEST");
			const phone = formatPhone(argv.test === true ? PHONE_TEST : (argv._[0] + ""));
			const pathPhone = `${pathSave}/${phone}`;

			if (argv.s)
				argv.save = true;
			else if (argv.save === undefined)
				argv.save = /^true|yes$/i.test(AUTOSAVE);

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

			// console.log(pathToken);

			{
				// Was saved here until version 1.0.6
				// TODO: Remove in version 2.0
				if (fs.existsSync(`${HOME}/.local/share/${prog}/auth`)) {
					fs.mkdirSync(pathToken, { recursive: true });
					fs.renameSync(`${HOME}/.local/share/${prog}/auth`, pathToken);
					fs.rmdirSync(`${HOME}/.local/share/${prog}`);
				}
				const client = await new Promise(resolve => {
					if (!fs.existsSync(pathToken) && argv.nonInteractive !== false)
						return resolve(null);
					try {
						const waclient = new WhatsApp.Client({
							authStrategy: new WhatsApp.LocalAuth({ dataPath: pathToken }),
							puppeteer: {
								// handleSIGINT: false,
								// headless: true,
								args: [
									"--no-sandbox",
									"--disable-setuid-sandbox",
									"--disable-extensions",
									'--disable-gpu',
									"--disable-accelerated-2d-canvas",
									"--no-first-run",
									"--no-zygote",
									"--disable-dev-shm-usage"
								],
								// takeoverOnConflict: true,
							},
							webVersionCache: {
								type: "remote",
								remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
							},
							qrMaxRetries: 2
						});

						waclient.on('qr', qr => {
							console.log("To login to WhatsApp, scan the following QRCode within WhatsApp settings");
							QRCcode.generate(qr, { small: true });
						});
						waclient.on('authenticated', qr => {
							// console.log("Authenticated");
						});
						waclient.on('ready', async () => {
							resolve(waclient);
						});
						waclient.initialize();
					}
					catch (e) {
						resolve(e);
					}
				});
				if (client === null)
					printText(`${colour("1;31")}\u2a2f\x1b[0m \x1b[1mWhatsApp:\x1b[0m No session found`);
				else {
					const user = await client.getContactById(phone + "@c.us");
					if (user !== null) {
						const [picture, number, about, chat] = await Promise.all([
							user.getProfilePicUrl(),
							user.getFormattedNumber(),
							user.getAbout(),
							user.getChat()
						]);
						// console.log(user);
						// return 0;

						if (!user.name && !user.pushname && !user.shortName && !picture && !about && typeof chat?.timestamp !== "number")
							printText(`${colour("1;31")}\u2a2f\x1b[0m \x1b[1mWhatsApp:\x1b[0m Phone not occupied`);
						else if (format === "text") {
							printText(`\r${colour("1;4")}WhatsApp:\x1b[0m
  Type:          ${user.isBusiness ? "Business" : (user.isEnterprise ? "Enterprise" : (user.isUser ? "User" : "Unknown"))}

  Name:          ${colour(NAME_COLOUR)}${user.name || ""}\x1b[0m
  Shortname:     ${colour(NAME_COLOUR)}${user.shortName || ""}\x1b[0m
  Pushname:      ${colour(NAME_COLOUR)}${user.pushname || ""}\x1b[0m

  Picture:       ${picture || ""}
  Phone:         ${typeColour(number)}${number || ""}\x1b[0m
  About:         ${colour("33")}${about || ""}\x1b[0m
  Last activity: ${typeof chat?.timestamp === "number" ? colour("35") + new Date(chat.timestamp * 1000) : "\x1b[3mUnknown"}\x1b[0m
`);
						}
						else {
							dataJson.whatsapp = {
								type: user.isBusiness ? "Business" : user.isUser ? "User" : null,
								name: user.name || "",
								shortname: user.shortName || "",
								pushname: user.pushname || "",
								picture: picture || "",
								phone: number || "",
								about: about || "",
								lastActivity: typeof chat?.timestamp === "number" ? new Date(chat.timestamp * 1000) : null
							}
						}
						if (argv.photo && typeof picture === "string") {
							const res = await new Promise(r => download(picture, `${pathPhone}/whatsapp.${picture.split('?', 2)[0].split('.').pop()}`, r));
							if (res instanceof Error)
								throw res;
						}
					}
					client.removeAllListeners();
					await client.destroy();
				}
				// spinner.succeed("");
			}
			{
				if (!/^[-A-Za-z0-9+/]{32,}={0,3}$/.test(API_TELEGRAM_TOKEN) && argv.nonInteractive !== false)
					printText(`${colour("1;31")}\u2a2f\x1b[0m \x1b[1mTelegram:\x1b[0m No session found`);
				else {
					const client = new TelegramClient(
						new StringSession(API_TELEGRAM_TOKEN),
						parseInt(API_TELEGRAM_ID),
						API_TELEGRAM_HASH,
						{
							baseLogger: new TelegramLogger("error")
						});

					await client.start({
						phoneNumber: async () => await input.text("Phone number to login:"),
						password: async () => await input.text("Account password:"),
						phoneCode: async () => await input.text("Received code:"),
						onError: err => undefined /*console.error(err)*/,
					});
					if (!/^[-A-Za-z0-9+/]{32,}={0,3}$/.test(API_TELEGRAM_TOKEN)) {
						var env = fs.readFileSync(__dirname + "/.env", 'utf-8')
						if (env.includes("API_TELEGRAM_TOKEN")) {
							const newEnv = env.split("\n")
								.map(v => v.replace(/API_TELEGRAM_TOKEN=?.*/g, `API_TELEGRAM_TOKEN="${client.session.save()}"`))
								.join("\n");
							// API_TELEGRAM_TOKEN isn't present in .env file
							if (env === newEnv)
								env += `\nAPI_TELEGRAM_TOKEN="${client.session.save()}"\n`;
							else
								env = newEnv;
						}
						else
							env += `\nAPI_TELEGRAM_TOKEN="${client.session.save()}"`;
						fs.writeFileSync(__dirname + "/.env", env, 'utf-8');
						printText(`${colour("1;32")}\u2714\x1b[0m Telegram token saved\n`);
					}

					// spinner.text = "Looking on Telegram";
					// spinner.start();
					await client.connect();

					try {
						const tg = await client?.invoke(
							new TelegramApi.contacts.ResolvePhone({
								phone
							})
						);
						if (tg !== undefined)
							tg.users = await Telegram.photo.get(client, tg.users);

						if (format === "text") {
							printText(`${colour("1;4")}Telegram:\x1b[0m`);
							const multipleAccount = tg.users.length !== 1;
							const pad = multipleAccount ? "    " : "  ";
							for (let i = 0; i < tg.users.length; ++i) {
								const {
									className,
									verified,
									restricted,
									premium,
									storiesHidden,
									botBusiness,
									firstName,
									lastName,
									username,
									phone: phoneNumber,
									photo,
									restrictionReason,
									langCode,
									status
								} = tg.users[i];
								const { wasOnline } = status || { wasOnline: null };

								// console.log(id, typeof id, accessHash, typeof accessHash);
								if (multipleAccount)
									console.log(`  ${colour("4")}${i} - ${username || `${firstName || ""} ${lastName || ""}`.trim()}:\x1b[0m`)
								printText(`${pad}Type:          ${className}
${pad}Bot Business:  ${typeColour(botBusiness)}${botBusiness}\x1b[0m
${pad}Restricted:    ${typeColour(restricted)}${restricted}\x1b[0m
${pad}Restriction Reason: ${restrictionReason || ""}

${pad}First name:    ${colour(NAME_COLOUR)}${firstName || ""}\x1b[0m
${pad}Last name:     ${colour(NAME_COLOUR)}${lastName || ""}\x1b[0m
${pad}Username:      ${colour(USERNAME_COLOUR)}${username || ""}\x1b[0m

${pad}Verified:      ${typeColour(verified)}${verified}\x1b[0m
${pad}Premium:       ${typeColour(premium)}${premium}\x1b[0m
${pad}Picture:       ${typeColour(Telegram.photo.isAvailable(photo))}${Telegram.photo.isAvailable(photo) ? "Have" : "Do not have"}\x1b[0m
${pad}Phone:         ${typeColour(phoneNumber)}${phoneNumber || ""}\x1b[0m
${pad}Language:      ${colour("32")}${langCode || ""}\x1b[0m
${pad}Last activity: ${typeof wasOnline === "number" ? colour("35") + new Date(wasOnline * 1000) : "\x1b[3mUnknown"}\x1b[0m`);
								if (argv.photo && Telegram.photo.isAvailable(photo))
									fs.writeFileSync(`${pathPhone}/telegram-${i}.jpg`, photo);
							}
						}
						else {
							dataJson.telegram = tg.users.map(user => {
								const {
									className,
									verified,
									restricted,
									premium,
									storiesHidden,
									botBusiness,
									firstName,
									lastName,
									username,
									phone: __phone,
									photo,
									restrictionReason,
									langCode,
									status
								} = user;
								const { wasOnline } = status || { wasOnline: null };
								return {
									className,
									verified,
									restricted,
									premium,
									storiesHidden,
									botBusiness,
									firstName,
									lastName,
									username,
									phone: __phone,
									photo: Telegram.photo.isAvailable(photo),
									restrictionReason,
									lang: langCode,
									lastActivity: new Date(wasOnline * 1000)
								};
							})
						}
					}
					catch (e) {
						if (e?.errorMessage === "PHONE_NOT_OCCUPIED")
							printText(`${colour("1;31")}\u2a2f\x1b[0m \x1b[1mTelegram:\x1b[0m Phone not occupied`);
						else
							console.error(e);
					}
				}
				// spinner.succeed("");
			}

			// console.log("${colour("1;32")}Done.\x1b[0m");
			if (format === "json")
				console.log(JSON.stringify(dataJson));
			if (argv.save === true)
				fs.writeFileSync(`${pathPhone}/info.${format === "text" ? "txt" : "json"}`, format === "text" ? dataText : JSON.stringify(dataJson));
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