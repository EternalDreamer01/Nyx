import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import input from "input";


export const TelegramApi = Api;

const { SESSION, API_ID, API_HASH } = process.env;
const session = new StringSession(SESSION);
const client = new TelegramClient(session, parseInt(API_ID), API_HASH, {});

export const Telegram = new Promise(async resolve => {
	try
	{
		await client.start({
			phoneNumber: async () => await input.text("number ?"),
			password: async () => await input.text("password ?"),
			phoneCode: async () => await input.text("Code ?"),
			onError: err => console.error(err),
		});
		console.log(client.session.save());
		await client.connect();
		resolve(client);
	}
	catch(err)
	{
		console.error(err);
		resolve(null);
	}
})

function start() {
	console.log('Client is ready!');

	const app = express();
	const port = 80;

	app.get('/style.css', (_, res) => res.sendFile("style.css", { root }));
	app.get('/', (_, res) => {
		res.html(
			"Venom",
			`<p>Enter a phone number in url, in this format:</p>
			<p style="font-weight:bold;">&lt;country code&gt;&lt;personal number&gt;</p>
			<p style="text-decoration: underline; margin-top:80px;">Example:</p>
			<table>
				<tr>
					<td>Country code</td>
					<td>44 (United Kingdom)</td>
				</tr>
				<tr>
					<td>Personal number</td>
					<td>1234 123456</td>
				</tr>
			</table>
			<p><a href="/441234123456">441234123456</a></p>`
		);
	});
	app.get('/:phone', async (req, res) => {
		try {
			const result = await client.invoke(
				new Api.contacts.ResolvePhone({
					phone: req.params.phone,
				})
			);
			console.log(result); // prints the result
			res.json(result);
			// res.html(contact.pushname || contact.shortName || number, html);
		}
		catch (e) {
			res.status(404);
			if (req.query.json)
				res.json({ error });
			else
				res.html("Not found", error);
		}
	});

	app.listen(port, () => {
		console.log(`Example app listening on port ${port}`)
	});
}
