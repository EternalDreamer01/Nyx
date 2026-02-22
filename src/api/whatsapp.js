import WhatsApp from "whatsapp-web.js";
import QRCcode from "qrcode-terminal";
import fs from "fs";
import https from "https";

import { colour, typeColour, COLOUR, removeDuplicateFiles } from "../utils.js";


export function create_table(db) {
	db.exec(`CREATE TABLE IF NOT EXISTS whatsapp(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		rawPhone TEXT UNIQUE,
		formattedPhone TEXT,
		type TEXT,
		name TEXT,
		pushname TEXT,
		about TEXT,
		lastActivity DATETIME,
		datetimeCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
		datetimeModified DATETIME DEFAULT CURRENT_TIMESTAMP,
		datetimeAccessed DATETIME DEFAULT CURRENT_TIMESTAMP
	)`);

	// TODO: remove in a later version
	// That is to maintain portability between version 2.1.0 and 2.2.0
	const alldata = db.prepare("SELECT 1 FROM pragma_table_info('whatsapp') WHERE name = 'datetimeCreated';").all();
	// console.log(typeof alldata, alldata);
	if (alldata.length == 0) {
		db.exec(`CREATE TABLE IF NOT EXISTS whatsapp0(
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			rawPhone TEXT UNIQUE,
			formattedPhone TEXT,
			type TEXT,
			name TEXT,
			pushname TEXT,
			about TEXT,
			lastActivity DATETIME,
			datetimeCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
			datetimeModified DATETIME DEFAULT CURRENT_TIMESTAMP,
			datetimeAccessed DATETIME DEFAULT CURRENT_TIMESTAMP
		);
		INSERT INTO whatsapp0(
			id,
			rawPhone,
			formattedPhone,
			type,
			name,
			pushname,
			about,
			lastActivity
		) SELECT * FROM whatsapp;
		DROP TABLE table whatsapp;
		ALTER TABLE whatsapp0 rename to whatsapp;
		`);
	}
}

function download(url, dest, cb) {
	const file = fs.createWriteStream(dest);

	https.get(url, (response) => {
		response.pipe(file);
		file.on('finish', () => {
			file.close(cb)
		});
	}).on('error', (err) => {
		fs.unlink(dest, cb(err));
	});
}

export async function Api({ db, argv, phone, pathPhone, pathToken, format, printText }) {
	db.prepare("UPDATE whatsapp SET datetimeModified = time('now'), datetimeAccessed = time('now') WHERE rawPhone = ?").run(phone);
	const client = await new Promise(resolve => {
		// console.log(pathToken, argv)
		if (!fs.existsSync(pathToken) && argv.nonInteractive === true)
			return resolve(null);

		try {
			const waclient = new WhatsApp.Client({
				authStrategy: new WhatsApp.LocalAuth({ dataPath: pathToken }),
				puppeteer: {
					// handleSIGINT: false,
					// headless: true,
					args: [
						"--no-sandbox",
						"--disable-extensions",
						'--disable-gpu',
						"--disable-accelerated-2d-canvas",
						"--no-first-run",
						"--no-zygote",
						"--disable-dev-shm-usage"
					],
					takeoverOnConflict: true,
				},
				qrMaxRetries: 2
			});

			waclient.on('qr', qr => {
				console.log("To login to WhatsApp, scan the following QRCode within WhatsApp settings");
				// console.log(qr)
				QRCcode.generate(qr, { small: true });
			});
			// waclient.on('authenticated', qr => {
			// 	console.log("Authenticated");
			// });
			waclient.on('ready', async () => {
				// console.log("ready");
				resolve(waclient);
			});
			waclient.initialize();
		}
		catch (e) {
			console.log(e)
			resolve(e);
		}
	});

	if (client === null)
		console.log(`${colour("1;31")}\u2a2f\x1b[0m \x1b[1mWhatsApp:\x1b[0m No session found`);
	else {
		// console.log("Logged in!");
		const user = await client.getContactById(phone + "@c.us");
		// console.log("Got contact by id !")
		if (user !== null) {
			const [picture, number, about, chat] = await Promise.allSettled([
				user.getProfilePicUrl(),
				user.getFormattedNumber(),
				user.getAbout(),
				user.getChat()
			]);
			// console.log(picture, number, about)
			// console.log(user);
			// return 0;

			if (!user.name && !user.pushname && !user.shortName && !picture && !about && typeof chat?.timestamp !== "number")
				console.log(`${colour("1;31")}\u2a2f\x1b[0m \x1b[1mWhatsApp:\x1b[0m Phone not occupied`);
			else {
				if (format === "text") {
					console.log(`\r${colour("1;4")}WhatsApp:\x1b[0m
	  Type:          ${user.isBusiness ? "Business" : (user.isEnterprise ? "Enterprise" : (user.isUser ? "User" : "Unknown"))}
	
	  Name:          ${colour(COLOUR.NAME)}${user.name || ""}\x1b[0m
	  Pushname:      ${colour(COLOUR.NAME)}${user.pushname || ""}\x1b[0m
	
	  Picture:       ${picture.value || "None"}, ${fs.readdirSync(pathPhone).filter(v => !v.endsWith(".txt") && !v.endsWith(".json")).length} saved
	  Phone:         ${typeColour(number)}${number.value || ""}\x1b[0m
	  About:         ${colour("33")}${about.value || ""}\x1b[0m
	  Last activity: ${typeof chat.value?.timestamp === "number" ? colour("35") + new Date(chat.value?.timestamp * 1000) : "\x1b[3mUnknown"}\x1b[0m
	`);
				}
				const dataJson = {
					type: user.isBusiness ? "Business" : user.isUser ? "User" : null,
					rawPhone: phone,
					formattedPhone: number.value,
					name: user.name,
					// shortname: user.shortName,
					pushname: user.pushname,
					picture: picture.value,
					about: about.value,
					lastActivity: chat.value?.timestamp
				};

				if (argv.save === true) {
					const data = Object.fromEntries(Object.entries(dataJson).filter(([_, v]) => v != null));
					delete data.picture;
					const dataLength = Object.keys(data).length;

					if (dataLength !== 0) {
						// console.log(data)
						// create_table(db);
						db.prepare(`
											INSERT INTO whatsapp(${Object.keys(data).join(',')})
												VALUES(${Object.keys(data).map(v => '?').join(',')})
											ON CONFLICT (rawPhone)
												DO UPDATE SET ${Object.keys(data).map(v => v + '=?').join(',')}
										`).run(...Object.values(data), ...Object.values(data));
					}
				}
				// console.log(argv, picture.value);
				if (argv.photo && typeof picture.value === "string") {
					const filepath = `${pathPhone}/whatsapp-${(new Date()).toISOString()}.${picture.value.split('?', 2)[0].split('.').pop()}`
					const res = await new Promise(r => download(picture.value, filepath, r));
					if (res instanceof Error)
						throw res;
					await removeDuplicateFiles(pathPhone);
				}
				return dataJson;
			}
		}

		client.removeAllListeners();
		await client.destroy();
	}
}