#!/bin/bash

if [[ $# -eq 0 ]]; then
	printf "{\"error\":\"No argument supplied\"}"
	exit 1
fi


curl 'https://www.instagram.com/api/graphql' --compressed -X POST \
-H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0' \
-H 'Origin: https://www.instagram.com' \
-H 'Referer: https://www.instagram.com/accounts/onetap/?next=%2F' \
-H 'Sec-Fetch-Dest: empty' \
-H 'Sec-Fetch-Mode: cors' \
-H 'Sec-Fetch-Site: same-origin' \
-H 'TE: trailers' --data-raw "variables=%7B%22data%22%3A%7B%22context%22%3A%22blended%22%2C%22include_reel%22%3A%22true%22%2C%22query%22%3A%22$1%22%2C%22rank_token%22%3A%221%7Ca%22%2C%22search_surface%22%3A%22web_top_search%22%7D%2C%22hasQuery%22%3Atrue%7D&server_timestamps=true&doc_id=6901177919928333"