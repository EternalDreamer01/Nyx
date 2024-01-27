import WhatsApp from 'whatsapp-web.js';
import QRCcode from "qrcode-terminal"
import { TimedPromise } from "./utils/misc.js";

export const Client = TimedPromise("WhatsApp", async resolve => {
	const client = new WhatsApp.Client({
		authStrategy: new WhatsApp.LocalAuth({
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

	client.on('qr', qr => {
		console.log('Scan the following QR Code:');
		QRCcode.generate(qr, { small: true });
	});
	client.on('ready', () => resolve(client));
	client.initialize();
});