# Venom

## Overview

Venom is a simple application - based on [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js/), and inspired by [venom](https://github.com/orkestral/venom) to simplify information gathering for phone numbers.


## Inspected application

### Messaging

- [x] WhatsApp
- [x] Telegram
- [ ] Messenger
- [ ] WeChat
- [ ] Kakao Talk

## Install

```sh
git clone https://github.com/MikeCod/venom-cli.git $HOME/.local/share/
cd $HOME/.local/share/venom-cli
npm i

# To install systemwide, to launch from anywhere (optional)
sudo ln -s $HOME/.local/share/venom-cli/venom /usr/bin/venom
```

### Access

***These variables shall be configured within your [.env](.env)*** (create one at root if you don't have one)

| Application | Access functioning |
|-|-|
| WhatsApp | QR code |
| Telegram | [**API Token**](https://my.telegram.org/apps) |

## FAQ

### Is the user notified about this ?
No

### Is it possible to login as another phone number but personal ?
Yes, it's a common thing to buy a prepaid SIM card from tobacconists.

## Disclaimer

This project is intended for educational and lawful purposes only. The primary goal is to provide users with a platform to learn and experiment with various technologies, programming languages, and security concepts in a controlled environment. The creators and contributors of this project do not endorse or support any malicious activities, including but not limited to hacking, unauthorized access, or any form of cybercrime.

Users are expected to use this project responsibly and in compliance with applicable laws and regulations. Unauthorized use of this project for any malicious or illegal activities is strictly prohibited. The creators and contributors disclaim any responsibility for any misuse or damage caused by the use of this project for unauthorized and unlawful purposes.

It is essential to respect the privacy and security of others and obtain explicit permission before attempting to access or modify any system or data. Any actions performed with the knowledge gained from this project should be conducted in an ethical manner, with a focus on enhancing cybersecurity awareness and promoting responsible use of technology.

By using this project, you acknowledge and agree to abide by the principles outlined in this disclaimer. If you do not agree with these terms, you are not authorized to use or contribute to this project.

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

## License

[MIT](LICENSE)