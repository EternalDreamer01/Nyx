#!/bin/bash

if [[ $# -eq 0 ]]; then
	printf "{\"error\":\"No argument supplied\"}"
	exit 1
fi


curl "https://scontent.cdninstagram.com$1" --compressed \
-H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0' \
-H 'X-IG-App-ID: 936619743392459' \
-H 'X-ASBD-ID: 129477' \
-H "Cookie: ds_user_id=$INSTAGRAM_ds_user_id; sessionid=$INSTAGRAM_sessionid;" \
-H 'Sec-Fetch-Dest: empty' \
-H 'Sec-Fetch-Mode: cors' \
-H 'Sec-Fetch-Site: same-origin' \
-H 'Origin: https://www.instagram.com' \
-H 'Referer: https://www.instagram.com/accounts/onetap/?next=%2F'
