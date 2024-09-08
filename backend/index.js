#!/usr/bin/env node

// import request from "request";
import express from "express";
import cors from "cors";

import * as Telegram from "./src/telegram.js";
import * as WhatsApp from "./src/whatsapp.js";
import * as Instagram from "./src/instagram.js";
import * as Facebook from "./src/facebook.js";
import config from "./config.json" assert { type: "json" };
import "./src/utils/proto.js";

const available_api = {
	"Telegram": Telegram,
	"WhatsApp": WhatsApp
};

const { ENABLED_API } = process.env;
let enabled_api = {};
if (ENABLED_API !== undefined) {
	for (const api_name of ENABLED_API.split(',')) {
		if (available_api[api_name] !== undefined)
			enabled_api[api_name] = available_api[api_name];
		else {
			console.error(`Unknown API ${api_name}`);
			process.exit(1);
		}
	}
}

else enabled_api = available_api;

Promise.all(Object.values(enabled_api).map(Api => Api.Client))
	.then(res => start(Object.keys(enabled_api).map(name => `${name}Client`).reduce((prev, curr, i) => ({ ...prev, [curr]: res[i] }), {})))
	.catch(err => console.error(err));

function start({ TelegramClient, WhatsAppClient }) {
	console.log("\n\x1b[1;32mAPI ready !\x1b[0m");

	const app = express();

	// app.use(cors({origin: '*'}));
	app.use(
		cors({ origin: config.corsWhitelist })
	);

	// app.use(function (req, res, next) {
	// 	if (config.corsWhitelist.indexOf(req.headers.origin) !== -1) {
	// 		res.header('Access-Control-Allow-Origin', req.headers.origin);
	// 		res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	// 		res.setHeader('Access-Control-Allow-Credentials', true);
	// 	}
	// 	res.header('Cross-Origin-Resource-Policy', 'cross-origin');
	// 	res.header('Cross-Origin-Embedder-Policy', 'credentialless');
	// 	res.header('Cross-Origin-Opener-Policy', 'unsafe-none');
	// 	next();
	// });

	app.get('/', (_, res) => {
		res.json({});
	});

	app.get('/phone/:phone', async (req, res) => {
		try {
			req.params.phone = req.params.phone.replaceAll(/\D/g, '');

			const wa = await WhatsAppClient?.getContactById(req.params.phone + "@c.us");
			var picture, number, about;
			if (wa !== undefined)
				var [picture, number, about] = await Promise.all([
					wa.getProfilePicUrl(),
					wa.getFormattedNumber(),
					wa.getAbout()
				]);
			const tg = await TelegramClient?.invoke(
				new Telegram.Api.contacts.ResolvePhone({
					phone: req.params.phone
				})
			);

			tg.users = await Telegram.getPhotos(TelegramClient, tg.users);

			if (wa?.pushname === undefined && !picture && !about && !tg?.users?.length)
				throw new Error("Not found");

			res.json({
				WhatsApp: wa?.pushname === undefined && !picture && !about ? null : {
					name: wa?.pushname,
					shortname: wa?.shortName,
					picture,
					number,
					about
				},
				Telegram: tg?.users?.filterObject(config.filter.telegram)
			});
		}
		catch (e) {
			console.error(e)
			res.status(204).json({ error: config.not_found });
		}
	});

	app.get("/name/:name", async (req, res) => {
		try {
			const ig = await Instagram.Profile(req.params.name);
			const tg = await TelegramClient?.invoke(
				new Telegram.Api.contacts.Search({
					q: req.params.name,
					limit: 1
				})
			);
			tg.users = await Telegram.getPhotos(TelegramClient, tg.users);
			res.json({
				Instagram: ig?.filter(config.filter.instagram),
				Telegram: tg?.users?.filterObject(config.filter.telegram)
			});
		}
		catch (e) {
			res.status(204).end();
		}
	});

	app.get("/search/:name", async (req, res) => {
		try {
			const fb = await Facebook.Search(req.params.name);
			const ig = await Instagram.Search(req.params.name);
			const tg = await TelegramClient?.invoke(
				new Telegram.Api.contacts.Search({
					q: req.params.name,
					limit: 400
				})
			);
			tg.users = await Telegram.getPhotos(TelegramClient, tg.users);
			console.log(fb, ig, config.filter);
			res.json({
				facebook: fb?.map(({ node }) => node),
				instagram: ig?.filterFn(({ user }) => user.filter(config.filter.instagram)),
				telegram: tg?.users?.filterObject(config.filter.telegram)
			});
		}
		catch (err) {
			res.status(204).end();
		}
	});

	app.get('/prox', async (req, res) => {
		if (!req.query.server)
			return res.json({ error: "No file specified" });
		if (!req.query.file)
			return res.json({ error: "No file specified" });
		try {
			console.log(req.query.file);
			const { headers, data } = await axios.get(req.query.file, { responseType: 'blob' });
			// res.setHeader("Content-Type", headers["content-type"]);
			// res.setHeader("Content-Disposition", headers["content-disposition"]);
			res.send(data);
		}
		catch (error) {
			res.json({ error });
		}
	});

	app.use((_, res) => res.status(404).json({ error: "Not found" }));

	app.listen(process.env.PORT, () => {
		console.log(`\x1b[1;32mVenom listening on port 0.0.0.0:${process.env.PORT}\x1b[0m`)
	});
}
