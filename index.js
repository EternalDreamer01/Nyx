#!/usr/bin/env node

import WhatsApp from 'whatsapp-web.js';
import QRCcode from "qrcode-terminal"
import express from "express";

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

client.on('ready', async () => {
	console.log('Client is ready!');

	const app = express();
	const port = 80;

	app.get('/:phone', async (req, res) => {
		try {

			if (!req.params.phone.endsWith("@c.us"))
				req.params.phone += "@c.us";
			const contact = await client.getContactById(req.params.phone);
			console.log(contact);
			res.send(
				`<html>
				<style>
					body {
						background:black;
						margin:10
					}
					* {
						color:white;
					}
				</style>
				<body>
					<img src="${await contact.getProfilePicUrl()}" />
					<p>${await contact.getFormattedNumber()}</p>
					<p>${contact.pushname}</p>
					<p>${await contact.getAbout()}</p>
				</body>
				</html>`
			);
		}
		catch (error) {
			console.error(error);
			res.send("Error");
		}
	});

	app.listen(port, () => {
		console.log(`Example app listening on port ${port}`)
	});
});

client.initialize();

