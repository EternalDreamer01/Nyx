
# TODO

- Prevent Blacklist
	- Latency between each call
	- Define limit, warn after numerous calls
- Data
	- Do not show name, shortname, first/last name ?
	- Show other WhatsApp's defined fields (labels, sectionHeader, verified)
- More reverse phone lookup
	- Allow multiple WhatsApp and Telegram accounts
	- Breached databases
	- [Truecaller](https://github.com/sumithemmadi/truecallerjs)
- Add unit tests for json
- Raise alert when one phone number created an account on Telegram: [googleapis](https://www.npmjs.com/package/googleapis#google-apis), [createContact](https://developers.google.com/people/api/rest/v1/people/createContact)

## Unavailable Reverse Phone Lookup

* [Signal](https://bbernhard.github.io/signal-cli-rest-api/#/): not possible
* [LINE](https://developers.line.biz/en/reference/messaging-api/#users): requires a user message
* [Viber](https://developers.viber.com/docs/api/nodejs-bot-api/#getUserDetails): requires a user message
* [WeChat](https://github.com/wechaty/wechaty): no phone number
* [SnapChat](https://developers.snap.com/api/marketing-api/Public-Profile-API/Profiles#retrieving-profile-information): not possible
* Kakao Talk

---

* [Messenger](https://developers.facebook.com/docs/messenger-platform/identity/user-profile): Require *Business Asset User Profile Access* feature