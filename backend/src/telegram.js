import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import input from "input";
import { TimedPromise } from "./utils/misc.js";

export { Api };

const { API_TELEGRAM_TOKEN, API_TELEGRAM_ID, API_TELEGRAM_SECRET } = process.env;
const session = new StringSession(API_TELEGRAM_TOKEN);
const client = new TelegramClient(session, parseInt(API_TELEGRAM_ID), API_TELEGRAM_SECRET, {});

export const Client = TimedPromise("Telegram", async resolve => {
	try {
		client.setLogLevel("warn");
		await client.start({
			phoneNumber: async () => await input.text("Phone number:"),
			password: async () => await input.text("Account password:"),
			phoneCode: async () => await input.text("Received code:"),
			onError: err => undefined /*console.error(err)*/,
		});
		if(!API_TELEGRAM_TOKEN)
		{
			console.log("Telegram token:", client.session.save());
			console.log("Make sure to save it safely");
		}
		await client.connect();
		resolve(client);
	}
	catch (err) {
		console.error(err);
		resolve(null);
	}
})

export async function getPhotos(TelegramClient, userList) {
	for(let i = 0; i < userList.length && i < 10 ; ++i) {
		const photo = await TelegramClient.downloadProfilePhoto(userList[i].id, {
			isBig: true
		});
		if(Buffer.isBuffer(photo))
			userList[i].photo = "data:image/jpeg;base64,"+(photo.toString('base64'));
	}
	return userList;
}