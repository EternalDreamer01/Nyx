#!/bin/bash

if [[ $# -lt 2 ]]; then
	printf "{\"error\":\"No argument supplied\"}"
	exit 1
fi


curl 'https://www.facebook.com/chantal.chabenat.3/photos_albums' --compressed -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8' -H 'Accept-Language: en-US,en;q=0.5' -H 'Accept-Encoding: gzip, deflate, br' -H 'DNT: 1' -H 'Alt-Used: www.facebook.com' -H 'Connection: keep-alive' -H 'Cookie: usida=eyJ2ZXIiOjEsImlkIjoiQXM3dG90MjE0bzFwNjUiLCJ0aW1lIjoxNzA2MjAzNjI0fQ%3D%3D; datr=pm6xZQrn99qwGQywgFCEstWO; wd=1800x1246; sb=XVuyZd7BMPXIChFfTFOgQPam; oo=v1%7C3%3A1706277288; c_user=100073381562742; xs=12%3ABFTXMwVFDF8zmQ%3A2%3A1706277289%3A-1%3A11757%3A%3AAcVMDoLWRh_NI4668DN_SiuIhbbUY-fC5M7pW6imvQ; presence=C%7B%22t3%22%3A%5B%5D%2C%22utc3%22%3A1706279728813%2C%22v%22%3A1%7D' -H 'Upgrade-Insecure-Requests: 1' -H 'Sec-Fetch-Dest: document' -H 'Sec-Fetch-Mode: navigate' -H 'Sec-Fetch-Site: none' -H 'Sec-Fetch-User: ?1' -H 'TE: trailers' | sed -E 's/\"/\n/g' | grep -iE '/(media|photo)/'