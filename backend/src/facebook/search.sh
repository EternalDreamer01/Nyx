#!/bin/bash

if [[ $# -eq 0 ]]; then
	printf "{\"error\":\"No argument supplied\",\"usage\":\"$0 <query> [<limit>]\"}"
	exit 1
fi


limit=${2:-400}


curl 'https://www.facebook.com/api/graphql/' --compressed -X POST \
-H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0' \
-H 'X-FB-Friendly-Name: CometSearchKeywordDataSourceQuery' \
-H "X-FB-LSD: $FACEBOOK_X_FB_LSD" \
-H 'X-ASBD-ID: 129477' \
-H 'Origin: https://www.facebook.com' \
-H 'Referer: https://www.facebook.com/home.php' \
-H "Cookie: c_user=$FACEBOOK_c_user; xs=$FACEBOOK_xs;" \
-H 'Sec-Fetch-Dest: empty' \
-H 'Sec-Fetch-Mode: cors' \
-H 'Sec-Fetch-Site: same-origin' \
-H 'TE: trailers' --data-raw "fb_dtsg=$FACEBOOK_fb_dtsg&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=CometSearchKeywordDataSourceQuery&variables=%7B%22query%22%3A%7B%22fetch_count%22%3A$limit%2C%22fetch_mode%22%3A%22blended%22%2C%22query_text%22%3A%22%5B%5C%22$1%5C%22%5D%22%2C%22request_id%22%3A%221%22%2C%22session_id%22%3A%220.%22%7D%7D&server_timestamps=true&doc_id=7003676376365206"