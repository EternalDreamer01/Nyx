import { Api as TelegramApi, TelegramClient, Logger as TelegramLogger } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import input from "input";
import fs from "fs";

import { colour, typeColour, COLOUR, removeDuplicateFiles } from "../utils.js";


export function create_table(db) {
	db.exec(`CREATE TABLE IF NOT EXISTS telegram(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		phone TEXT UNIQUE,
		className TEXT,
		bot BOOLEAN,
		verified BOOLEAN,
		restricted BOOLEAN,
		restrictionReason TEXT,
		support BOOLEAN,
		scam BOOLEAN,
		fake BOOLEAN,
		premium BOOLEAN,
		storiesHidden BOOLEAN,
		botBusiness BOOLEAN,
		firstName TEXT,
		lastName TEXT,
		username TEXT,
		emojiStatus TEXT,
		color TEXT,
		profileColor TEXT,
		langCode TEXT,
		lastActivity DATETIME,
		datetimeCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
		datetimeModified DATETIME DEFAULT CURRENT_TIMESTAMP,
		datetimeAccessed DATETIME DEFAULT CURRENT_TIMESTAMP
	)`);

	// TODO: remove in a later version
	// That is to maintain portability between version 2.1.0 and 2.2.0
	const alldata = db.prepare("SELECT 1 FROM pragma_table_info('telegram') WHERE name = 'datetimeCreated';").all();
	// console.log(typeof alldata, alldata);
	if (alldata.length == 0) {
		db.exec(`CREATE TABLE IF NOT EXISTS telegram0(
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			phone TEXT UNIQUE,
			className TEXT,
			bot BOOLEAN,
			verified BOOLEAN,
			restricted BOOLEAN,
			restrictionReason TEXT,
			support BOOLEAN,
			scam BOOLEAN,
			fake BOOLEAN,
			premium BOOLEAN,
			storiesHidden BOOLEAN,
			botBusiness BOOLEAN,
			firstName TEXT,
			lastName TEXT,
			username TEXT,
			emojiStatus TEXT,
			color TEXT,
			profileColor TEXT,
			langCode TEXT,
			lastActivity DATETIME,
			datetimeCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
			datetimeModified DATETIME DEFAULT CURRENT_TIMESTAMP,
			datetimeAccessed DATETIME DEFAULT CURRENT_TIMESTAMP
		);
		INSERT INTO telegram0(
			id,
			phone,
			className,
			bot,
			verified,
			restricted,
			restrictionReason,
			support,
			scam,
			fake,
			premium,
			storiesHidden,
			botBusiness,
			firstName,
			lastName,
			username,
			emojiStatus,
			color,
			profileColor,
			langCode,
			lastActivity
		) SELECT * FROM telegram;
		DROP TABLE table telegram;
		ALTER TABLE telegram0 rename to telegram;
		`);
	}
}

async function photo_download(client, userList) {
	for (let i = 0; i < userList.length && i < 10; ++i) {
		userList[i].photo = await client.downloadProfilePhoto(userList[i].id, {
			isBig: true
		});
	}
	return userList;
}

function photo_is_available(buf) {
	if (Buffer.isBuffer(buf))
		return buf.byteLength !== 0;
	else if (typeof buf === "string")
		return buf.length !== 0;
	return false;
}

export async function Api({ db, phone, argv, pathPhone, __dirname, format, printText }) {
	db.prepare("UPDATE telegram SET datetimeModified = time('now'), datetimeAccessed = time('now') WHERE phone = ?").run(phone);
	const {
		API_TELEGRAM_TOKEN,
		API_TELEGRAM_ID,
		API_TELEGRAM_HASH
	} = process.env;

	if (!/^[-A-Za-z0-9+/]{32,}={0,3}$/.test(API_TELEGRAM_TOKEN) && argv.nonInteractive === true)
		console.log(`${colour("1;31")}\u2a2f\x1b[0m \x1b[1mTelegram:\x1b[0m No session found`);
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
			console.log(`${colour("1;32")}\u2714\x1b[0m Telegram token saved\n`);
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
				tg.users = await photo_download(client, tg.users);

			// console.log(tg.users)
			if (format === "text") {
				console.log(`${colour("1;4")}Telegram:\x1b[0m`);
				const multipleAccount = tg.users.length !== 1;
				if (multipleAccount)
					console.warn("Multiple Telegram account. Nyx 2 cannot save multiple accounts");

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
					console.log(`${pad}Type:          ${className}
${pad}Bot Business:  ${typeColour(botBusiness)}${botBusiness}\x1b[0m
${pad}Restricted:    ${typeColour(restricted)}${restricted}\x1b[0m
${pad}Restriction Reason: ${restrictionReason || ""}

${pad}First name:    ${colour(COLOUR.NAME)}${firstName || ""}\x1b[0m
${pad}Last name:     ${colour(COLOUR.NAME)}${lastName || ""}\x1b[0m
${pad}Username:      ${colour(COLOUR.USERNAME)}${username || ""}\x1b[0m

${pad}Verified:      ${typeColour(verified)}${verified}\x1b[0m
${pad}Premium:       ${typeColour(premium)}${premium}\x1b[0m
${pad}Picture:       ${typeColour(photo_is_available(photo))}${photo_is_available(photo) ? "Have" : "Do not have"}\x1b[0m
${pad}Phone:         ${typeColour(phoneNumber)}${phoneNumber || ""}\x1b[0m
${pad}Language:      ${colour("32")}${langCode || ""}\x1b[0m
${pad}Last activity: ${typeof wasOnline === "number" ? colour("35") + new Date(wasOnline * 1000) : "\x1b[3mUnknown"}\x1b[0m`);
					if (argv.photo && photo_is_available(photo)) {
						fs.writeFileSync(`${pathPhone}/telegram-${(new Date()).toISOString()}-${i}.jpg`, photo);
						await removeDuplicateFiles(pathPhone);
					}
				}
			}
			const dataJson = tg.users.map(user => {
				const {
					className,
					bot,
					verified,
					restricted,
					support,
					scam,
					fake,
					premium,
					storiesHidden,
					botBusiness,
					firstName,
					lastName,
					username,
					emojiStatus,
					color,
					profileColor,
					phone: __phone,
					photo,
					restrictionReason,
					langCode,
					status
				} = user;
				const { wasOnline } = status || { wasOnline: null };
				return {
					className,
					bot,
					verified,
					restricted,
					support,
					scam,
					fake,
					premium,
					storiesHidden,
					botBusiness,
					firstName,
					lastName,
					username,
					emojiStatus,
					color,
					profileColor,
					phone: __phone,
					photo: photo_is_available(photo),
					restrictionReason,
					langCode,
					lastActivity: wasOnline
				};
			});

			if (argv.save === true) {
				for (const user of dataJson) {
					const data = Object.fromEntries(Object.entries(user).filter(([_, v]) => v != null));
					delete data.photo;
					const dataLength = Object.keys(data).length;

					if (dataLength !== 0) {
						create_table(db);
						// console.log(data);
						const dataValues = Object.values(data).map(v => typeof v === "boolean" ? (v ? 1 : 0) : v);
						// console.log(data, dataValues)
						db.prepare(`
									INSERT INTO telegram(${Object.keys(data).join(',')})
										VALUES(${Object.keys(data).map(v => '?').join(',')})
									ON CONFLICT (phone)
										DO UPDATE SET ${Object.keys(data).map(v => v + '=?').join(',')}
								`).run(...dataValues, ...dataValues);
					}
				}
			}
			return dataJson
		}
		catch (e) {
			if (e?.errorMessage === "PHONE_NOT_OCCUPIED")
				console.log(`${colour("1;31")}\u2a2f\x1b[0m \x1b[1mTelegram:\x1b[0m Phone not occupied`);
			else
				console.error(e);
		}
	}
}