#!/usr/bin/env node

import express from "express";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from "fs";

import * as Telegram from "./src/telegram.js";
import * as WhatsApp from "./src/whatsapp.js";
import * as Instagram from "./src/instagram.js";
import * as Facebook from "./src/facebook.js";
import config from "./config.json" assert { type: "json" };
import "./src/utils/proto.js";


export const root = dirname(fileURLToPath(import.meta.url));


Promise.all([Telegram.Client, WhatsApp.Client])
	.then(res => start(res))
	.catch(err => console.error(err));

const publicFolder = "public/";

function start([TelegramClient, WhatsAppClient]) {
	console.log('Client is ready!');

	const app = express();
	const port = 80;

	fs.readdirSync(publicFolder).forEach(file => {
		console.log(file);
		app.get(`/${file}`, (_, res) => res.sendFile(`${publicFolder}${file}`, { root }));
	});

	app.get('/', (_, res) => {
		res.html({
			content:
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
		});
	});
	app.get('/phone/:phone', async (req, res) => {
		try {
			console.log("Looking for " + req.params.phone);

			const wa = await WhatsAppClient.getContactById(req.params.phone + "@c.us");
			const [picture, number, about] = await Promise.all([
				wa.getProfilePicUrl(),
				wa.getFormattedNumber(),
				wa.getAbout()
			]);
			const tg = await TelegramClient.invoke(
				new Telegram.Api.contacts.ResolvePhone({
					phone: req.params.phone
				})
			);

			if (wa.pushname === undefined && !picture && !about && !tg.users.filter(u => u.username != null).length)
				throw new Error("Not found");

			if (req.query.json)
				return res.json({
					whatsapp: {
						name: wa.pushname,
						shortname: wa.shortName,
						picture,
						number,
						about
					},
					telegram: tg.users.filterObject(config.filter.telegram)
				});

			let html = (picture !== undefined ? `<img src="${picture}" />` : "") + "<table>" +
				Object.entries({
					number,
					about
				})
					.map(([field, content]) => (
						`<tr>
						<td>${field.charAt(0).toUpperCase() + field.slice(1)}</td>
						<td>${content}</td>
					</tr>`
					)) +
				"</table>";

			res.html({ title: wa.pushname || wa.shortName || tg.users[0].username || number, content: html });
		}
		catch (e) {
			res.status(404);
			if (req.query.json)
				res.json({ error: config.not_found });
			else
				res.html({ title: "Not found", content: config.not_found });
		}
	});

	app.get("/name/:name", async (req, res) => {
		try {
			const ig = await Instagram.Get(req.params.name);
			const tg = await TelegramClient.invoke(
				new Telegram.Api.contacts.Search({
					q: req.params.name,
					limit: 1
				})
			);
			res.json({
				instagram: ig.filter(config.filter.instagram),
				telegram: tg.users.filterObject(config.filter.telegram)
			});
		}
		catch (e) {
			res.status(400).end();
		}
	});

	app.get("/search/:name", async (req, res) => {
		try {
			const fb = await Facebook.Search(req.params.name);
			const ig = await Instagram.Search(req.params.name);
			const tg = await TelegramClient.invoke(
				new Telegram.Api.contacts.Search({
					q: req.params.name,
					limit: 400
				})
			);
			console.log(fb, ig, config.filter);
			res.json({
				facebook: fb,
				instagram: ig?.filterFn(({ user }) => user.filter(config.filter.instagram)),
				telegram: tg.users.filterObject(config.filter.telegram)
			});
		}
		catch (err) {
			res.status(400).end();
		}
	});

	app.use((_, res) => res.reply(404));

	app.listen(port, () => {
		console.log(`Example app listening on port ${port}`)
	});
}
