import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import input from "input";


export { Api };

const { API_TELEGRAM_TOKEN, API_TELEGRAM_ID, API_TELEGRAM_SECRET } = process.env;
const session = new StringSession(API_TELEGRAM_TOKEN);
const client = new TelegramClient(session, parseInt(API_TELEGRAM_ID), API_TELEGRAM_SECRET, {});

export const Client = new Promise(async resolve => {
	try {
		await client.start({
			phoneNumber: async () => await input.text("number ?"),
			password: async () => await input.text("password ?"),
			phoneCode: async () => await input.text("Code ?"),
			onError: err => console.error(err),
		});
		console.log("Telegram token:", client.session.save());
		await client.connect();
		resolve(client);
	}
	catch (err) {
		console.error(err);
		resolve(null);
	}
})
