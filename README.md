# Nyx 🌙

## Overview

Nyx is a simple reverse phone lookup.

## Install

```sh
npm i -g nyx-lookup
```

### Requirements

* Node 18+

### Setup Inspected Applications

| API | Information | Access | Session location |
|-|-|-|-|
| WhatsApp | <ul><li>Type (User/Business)</li><li>[Name / push name / Short name](#whats-the-difference-between-name-pushname-and-shortname-) </li><li>Picture</li><li>About</li><li>Last activity</li></ul> | QR code | <table><thead><tr><th>OS</th><th>Directory</th></tr></thead><tbody><tr><td>Windows</td><td>`%AppData%`</td></tr><tr><td>Linux</td><td>`~/.cache`</td></tr><tr><td>macOS</td><td>`~/Library/Caches`</td></tr></tbody></table> |
| Telegram | <ul><li>Type (User/Business)</li><li>Bot</li><li>Restriction</li><li>First/last name / Username</li><li>Verified</li><li>Premium</li><li>Picture</li><li>Language</li><li>Last activity</li></ul> | [**API Token**](https://my.telegram.org/apps) | Environment. See `nyx-lookup -e` |

## Usage

```
$ nyx-lookup
                                        ..                      
                           u.    u.    @L             uL   ..   
                         x@88k u@88c. 9888i   .dL   .@88b  @88R 
                        ^"8888""8888" `Y888k:*888. '"Y888k/"*P  
                          8888  888R    888E  888I    Y888L     
                          8888  888R    888E  888I     8888     
                          8888  888R    888E  888I     `888N    
                          8888  888R    888E  888I  .u./"888&   
                         "*88*" 8888"  x888N><888' d888" Y888*" 
                           ""   'Y"     "88"  888  ` "Y   Y"    
Usage: nyx-lookup phone                       88F               
                                             98"                
  phone             International format   ./"                  
                                          ~`
  -p --photo        Download photo
  -s --[no-]save    Save all user data (implies photo) into '/home/<user>/nyx-lookup' (autosave: yes)
  -f --format=FMT   Define output format (default: text)
                    Available formats: 'text', 'json'
  -c --[no-]colour  No colour (only usable in 'text' format for stdout)
  -e --env          Edit env file (default editor: vim)
     --clean        Clean up sessions (simple unlink/edit)

  -h  --help        Show this help
  
  Status:
    WhatsApp: ✔
    Telegram: ✔
```
```sh
$ nyx-lookup "+41 0000 000000"
```

## FAQ

### Is the user notified about this ?
No

### Is it possible to login as another phone number but personal ?
Yes - it'd be advised to prevent ban - it's a common thing to buy a prepaid SIM card from tobacconists or local stores.

### Can a user actually have WhatsApp or Telegram but doesn't appear ?
Yes, users can always change their profile visibility. To view or edit these settings :
* WhatsApp : Settings > Privacy
* Telegram : Settings > Privacy and Security

### Are there any risk ?
Your phone can be banned by WhatsApp and/or Telegram, make sure to not overuse this application.
A reasonable reverse lookup frequency would be 40/day (each one different), waiting at least a few seconds seconds between each call, at an irregular frequency.
Use a prepaid SIM card to prevent such situations.

### Is it legal ?
It's legal to view publicly available information. However, scraping would violate Terms of Use of WhatsApp and Telegram and would result in a permanent suspension.

### What's the difference between "name", "pushname" and "shortname" ?
|||
|-|-|
| `name` | The name registered for this phone number on your personal WhatsApp account |
| `shortname` | Your prefered shortname configured on your device (first name or last name), when this phone number is registered on your WhatsApp account |
| `pushname` | The name configured on their WhatsApp |

## Frequent Issues

### Cache
If you were getting this error:
```
Error: Evaluation failed: Error: wid error: invalid wid
```
Try cleaning up cache using `nyx-lookup --clean` or `rm -rf ~/.cache/nyx-lookup/`

### Outdated Version
If you were getting this error:
```
Error: Evaluation failed: TypeError: Cannot read properties of undefined (reading 'default')
```
Make sure you have the latest version of Nyx, or try reinstalling. If you installed it globally using npm:
```sh
npm uninstall -g nyx-lookup
npm install -g nyx-lookup
```

## Known issues
At the moment, `whatsapp-web.js` depends on a vulnerable version of `puppeteer`, see `npm audit` for more information.

### Unavailable Reverse Phone Lookup

* Signal
* LINE
* Viber
* Messenger
* WeChat
* Kakao Talk

## Disclaimer

This project is intended for educational and lawful purposes only. The primary goal is to provide users with a platform to learn and experiment with various technologies, programming languages, and security concepts in a controlled environment. The creators and contributors of this project do not endorse or support any malicious activities, including but not limited to hacking, unauthorized access, or any form of cybercrime.

Users are expected to use this project responsibly and in compliance with applicable laws and regulations. Unauthorized use of this project for any malicious or illegal activities is strictly prohibited. The creators and contributors disclaim any responsibility for any misuse or damage caused by the use of this project for unauthorized and unlawful purposes.

It is essential to respect the privacy and security of others and obtain explicit permission before attempting to access or modify any system or data. Any actions performed with the knowledge gained from this project should be conducted in an ethical manner, with a focus on enhancing cybersecurity awareness and promoting responsible use of technology.

By using this project, you acknowledge and agree to abide by the principles outlined in this disclaimer. If you do not agree with these terms, you are not authorized to use or contribute to this project.

## TODO

- OS Support
	- Windows
	- MacOS
	- FreeBSD
- Prevent Blacklist
	- Latency between each call
	- Define limit, warn after numerous calls
- Data
	- Do not show name, shortname, first/last name ?
	- Show other WhatsApp's defined fields (labels, sectionHeader, verified)
- More reverse phone lookup
	- Breached databases

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

## License

[LGPL-3.0 or later](LICENSE)
