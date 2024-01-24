import WhatsAppWeb from 'whatsapp-web.js';
import QRCcode from "qrcode-terminal"


const { Client, LocalAuth, Contact } = WhatsAppWeb;
export const WhatsAppUser = Contact;

export const WhatsApp = new Promise(async resolve => {
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

	client.on('qr', qr => {
		console.log('Scan the following QR Code:');
		QRCcode.generate(qr, { small: true });
	});
	client.on('ready', () => resolve(client));
	client.initialize();
});