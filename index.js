#!/usr/bin/env node

import express from "express";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from "fs";

import { Telegram, TelegramApi } from "./src/telegram.js";
import { WhatsApp, WhatsAppUser } from "./src/whatsapp.js";
import "./src/utils/proto.js";
import config from "./config.json" assert { type: "json" };


export const root = dirname(fileURLToPath(import.meta.url));


Promise.all([Telegram, WhatsApp])
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
	app.get('/:phone', async (req, res) => {
		try {
			console.log("Looking for " + req.params.phone);

			const wa = await WhatsAppClient.getContactById(req.params.phone + "@c.us");
			const [picture, number, about] = await Promise.all([
				wa.getProfilePicUrl(),
				wa.getFormattedNumber(),
				wa.getAbout()
			]);
			const tg = await TelegramClient.invoke(
				new TelegramApi.contacts.ResolvePhone({
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
					telegram: tg.users.map(user => (
							Object.entries(user)
							.filter(([key]) => config.filter.telegram.includes(key))
							.reduce((prev, curr) => ({...prev, [curr[0]]:curr[1]}), {})
					))
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

	app.listen(port, () => {
		console.log(`Example app listening on port ${port}`)
	});
}
