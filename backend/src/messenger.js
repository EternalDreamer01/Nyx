import axios from "axios";


const { API_MESSENGER_TOKEN, API_MESSENGER_ID, API_MESSENGER_SECRET } = process.env;

class Messenger {
	constructor() {
		this.accessToken = API_MESSENGER_TOKEN || `${API_MESSENGER_ID}%7C${API_MESSENGER_SECRET}`
	}
	getId = id => (
		axios.get(`https://graph.facebook.com/${id}?fields=id,name,email,picture&access_token=${this.accessToken}`)
	)
}

export const MessengerClient = new Messenger();