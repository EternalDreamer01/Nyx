# Nyx 🌙

## Overview

Nyx is a **simple reverse phone lookup** ;
that is, a tool to obtain information about the subscriber (owner) of the phone number.

Please read [Disclaimer](#disclaimer), [is it legal ?](#is-it-legal-) and [Are there any risk ?](#are-there-any-risk-).

**When the features become the weaknesses...**

Nyx aims to highlight the weaknesses of instant‑messaging apps and increase public awareness of them. These common features allow malicious actors to perform reverse phone lookups and harvest personal data associated with a phone number.
These data include :
* Username
* Photo
* Bio
* Last activity
* and more...

## Table of contents 

2. [Disclaimer](#disclaimer)
2. [Install](#install)
2. [Usage](#usage)
2. [FAQ](#faq)
	* [Is the user notified about this ?](#is-the-user-notified-about-this-)
	* [Is it possible to login as another phone number but personal ?](#is-it-possible-to-login-as-another-phone-number-but-personal-)
	* [Are there any risk ?](#are-there-any-risk-)
	* [Is it legal ?](#is-it-legal-)
	* [What's the difference between "name" and "pushname" ?](#whats-the-difference-between-name-and-pushname-)


## Disclaimer

This project is intended for educational and lawful purposes only. The primary goal is to provide users with a platform to learn and experiment with various technologies, programming languages, and security concepts in a controlled environment. The creators and contributors of this project do not endorse or support any malicious activities, including but not limited to hacking, unauthorized access, or any form of cybercrime.

Users are expected to use this project responsibly and in compliance with applicable laws and regulations. Unauthorized use of this project for any malicious or illegal activities is strictly prohibited. The creators and contributors disclaim any responsibility for any misuse or damage caused by the use of this project for unauthorized and unlawful purposes.

It is essential to respect the privacy and security of others and obtain explicit permission before attempting to access or modify any system or data. Any actions performed with the knowledge gained from this project should be conducted in an ethical manner, with a focus on enhancing cybersecurity/privacy awareness and promoting responsible use of technology.

By using this project, you acknowledge and agree to abide by the principles outlined in this disclaimer. If you do not agree with these terms, you are not authorized to use or contribute to this project.

## Install

```sh
npm i -g nyx-lookup
```

### Development

```sh
git clone --recurse-submodules -j4 https://github.com/EternalDreamer01/Nyx.git
```

### Prerequisites

* Node 20+

### Setup Inspected Applications

| API | Information | Login | Session location |
|-|-|-|-|
| WhatsApp | <ul><li>Type (User/Business)</li><li>[Name / pushname](#whats-the-difference-between-name-pushname-and-shortname-) </li><li>Picture</li><li>About</li><li>Last activity</li></ul> | QR code | <table><thead><tr><th>OS</th><th>Directory</th></tr></thead><tbody><tr><td>Windows</td><td>`%LocalAppData%`</td></tr><tr><td>Linux</td><td>`~/.cache`</td></tr><tr><td>macOS</td><td>`~/Library/Caches`</td></tr></tbody></table> |
| Telegram | <ul><li>Type (User/Business)</li><li>Bot</li><li>Restriction</li><li>First/last name / Username</li><li>Verified</li><li>Premium</li><li>Picture</li><li>Language</li><li>Last activity</li></ul> | [**API Token**](https://my.telegram.org/apps) | Environment. See `nyx-lookup -e` |

You must login to use their API ;
* WhatsApp access is via a QR Code
* Telegram access is via an [API token](https://my.telegram.org/apps). Edit with the command `nyx-lookup -e`:
	* `API_TELEGRAM_ID` and `API_TELEGRAM_HASH`
	* Login once with the code you receive, it will store the token in `API_TELEGRAM_TOKEN`


## Usage

__Supports international phone format only__

Raw format is digits only (e.g `61491570006`) however, you may optionally specify :
* `+` at the beginning, eventually followed by `0`: `+0448081570192`
* `-`, `.`, ` ` (space), `/` and `\` anywhere: `61 491-570-006`

```sh
$ nyx-lookup "+44 808 157 0192"
$ nyxl 448081570192
```
```
$ nyx-lookup
Usage: nyx-lookup [options] phone

  -p --photo        Download photo into '/home/<user>/nyx-lookup'
  -s --[no-]save    Save user info and photo (autosave: yes)
  -f --format={ text | json }
                    Define output format (default: text)
  -c --[no-]colour  No colour (only usable in 'text' format for stdout)
  -e --env          Edit env file (default editor: vim)
     --clean        Clean up sessions (simple unlink/edit)
     --non-interactive
                    Will not ask to login if no session was found
     --api={ wa | tg | all }
                    API service to use
     --force        Force query, do not use cached data.

     --test         Test phone from env. variable PHONE_TEST
  
  -h  --help        Show this help
  -v  --version     Show version
  
  Status:
    WhatsApp: ✔
    Telegram: ✔
```

### Variables

Editable using `nyx-lookup -e` ;

| Variable | Description | Default | Possible values |
|-|-|-|-|
| `API_TELEGRAM_ID` | Telegram ID (required to use Telegram API) | *None* | |
| `API_TELEGRAM_HASH` | Telegram Hash (required to use Telegram API) | *None* | |
| `DEFAULT_INFO_FORMAT` | Default output format | `text` | `text` or `json` |
| `AUTOSAVE` | Enable/disable autosave (`~/nyx-lookup/saved.db`) | `true` | `true`/`false`, `yes`/`no`, `1`/`0` |
| `PHONE_TEST` | Phone number to use for testing | *None* | |

The database of saved results is accessible at `~/nyx-lookup/saved.db`.
To enable/disable autosave, run `nyx-lookup -e` and edit `AUTOSAVE`.

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
The possible potential risks, temporary or permanently :
1. Restricted to use WhatsApp through another device, or Telegram API
2. Account suspension via phone number

A reasonable reverse lookup frequency would be ;
| WhatsApp | Telegram |
|-|-|
| 4/day | 12/day |

Waiting at least a few seconds between each call, at an irregular frequency.
Use a prepaid SIM card to prevent such situations.

### Is it legal ?
It's legal to view publicly or freely available information, when the user is aware of this feature and consented to it.
However, scraping would be considered a privacy violation in many jurisdiction (including EU and US), and would violate Terms of Use of WhatsApp and Telegram.

Doing so could result in a permanent suspension, and a criminal penalty.

Moreover, the constant storage of this data could be considered a privacy violation (mainly for EU). You might consider editing `AUTOSAVE` and manage your cache yourself.
You alone bear full responsibility for any misuse or damage resulting from the unauthorized or unlawful use of this project.

### What's the difference between "name" and "pushname" ?
|||
|-|-|
| `name` | The name registered for this phone number on your personal WhatsApp account |
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

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

## License

[LGPL-3.0 or later](LICENSE)
