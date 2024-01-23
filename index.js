#!/usr/bin/env node

import WhatsApp from 'whatsapp-web.js';
import QRCcode from "qrcode-terminal"
import express from "express";
import { ServerResponse } from "http";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

export const root = dirname(fileURLToPath(import.meta.url));


ServerResponse.prototype.html = function (title, content) {
	return this.send(`<!DOCTYPE html>
	<html lang="en-UK">
	<head>
		<meta charset="UTF-8">
		<link rel="stylesheet" type="text/css" href="/style.css" media="all" />
		<title>${title}</title>
	</head>
	<body>
		<h1>${title}</h1>
		${content}
	</body>
	</html>`);
}

const { Client, LocalAuth, Contact } = WhatsApp;
const client = new Client({
	authStrategy: new LocalAuth({
		dataPath: 'auth'
	}),
	puppeteer: {
		headless: true,
		args: [
			'--no-default-browser-check',
			'--disable-session-crashed-bubble',
			'--disable-dev-shm-usage',
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-accelerated-2d-canvas',
			'--no-first-run',
		],
		takeoverOnConflict: true,
	}
});

client.on('qr', (qr) => {
	console.log('Scan the following QR Code:');
	QRCcode.generate(qr, { small: true });
});

const error = "This phone number is not registered on WhatsApp or does not have enough public information";

client.on('ready', () => {
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
			const contact = await client.getContactById(req.params.phone + "@c.us");
			const [picture, number, about] = await Promise.all([
				contact.getProfilePicUrl(),
				contact.getFormattedNumber(),
				contact.getAbout()
			]);
			if (contact.pushname === undefined && !picture && !about)
				throw new Error("Not found");

			if (req.query.json)
				return res.json({
					name: contact.pushname,
					picture,
					number,
					about
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
			res.html(contact.pushname || number, html);
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
});

client.initialize();

