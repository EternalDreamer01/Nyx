# Nyx 🌙

## Overview

Nyx is a simple reverse phone number lookup.

## Inspected application

- [x] WhatsApp
- [x] Telegram
- [ ] ~~Messenger~~ 
- [ ] ~~WeChat~~
- [ ] ~~Kakao Talk~~

*~~Striked names~~ mean no reverse phone lookup available*

## Install

```sh
git clone https://github.com/MikeCod/Nyx.git $HOME/.local/share/nyx
cd $HOME/.local/share/nyx
npm i
ln -s $HOME/.local/share/nyx/nyx $HOME/.local/bin/
```

### Access

***These variables shall be configured within your .env*** (create one at root if you don't have one)

| Application | Access functioning |
|-|-|
| WhatsApp | QR code |
| Telegram | [**API Token**](https://my.telegram.org/apps) |

## Usage

```
$ nyx
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
Usage: nyx phone                              88F               
                                             98"                
  phone           International format     ./"                  
                                          ~`
  -p --photo      Download photo
  -s --save       Save all user data (implies photo) into '/home/<user>/nyx'
  -f --format=FMT Define output format (default: text)
                  Available formats: 'text', 'json'
  --no-colour     No colour (only usable in 'text' format for stdout)

  -h  --help      Show this help
```

```sh
$ nyx "+44 0000 000000"
```

## FAQ

### Is the user notified about this ?
No

### Is it possible to login as another phone number but personal ?
Yes, it's a common thing to buy a prepaid SIM card from tobacconists or local stores.

### Can a user actually have WhatsApp or Telegram but doesn't appear ?
Yes, users can always change their profile visibility.

## Disclaimer

This project is intended for educational and lawful purposes only. The primary goal is to provide users with a platform to learn and experiment with various technologies, programming languages, and security concepts in a controlled environment. The creators and contributors of this project do not endorse or support any malicious activities, including but not limited to hacking, unauthorized access, or any form of cybercrime.

Users are expected to use this project responsibly and in compliance with applicable laws and regulations. Unauthorized use of this project for any malicious or illegal activities is strictly prohibited. The creators and contributors disclaim any responsibility for any misuse or damage caused by the use of this project for unauthorized and unlawful purposes.

It is essential to respect the privacy and security of others and obtain explicit permission before attempting to access or modify any system or data. Any actions performed with the knowledge gained from this project should be conducted in an ethical manner, with a focus on enhancing cybersecurity awareness and promoting responsible use of technology.

By using this project, you acknowledge and agree to abide by the principles outlined in this disclaimer. If you do not agree with these terms, you are not authorized to use or contribute to this project.

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

## License

[LGPL-3.0 or later](LICENSE)