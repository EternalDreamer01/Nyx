#!./test/bats/bin/bats

prog="nyx-lookup"
cache_dir="$HOME/.cache/nyx-lookup"
cache_test="$HOME/.cache/nyx-lookup-test"
env_path="./.env"
env_test="./.env.test"


sqlite_exec() {
	echo ".exit" | sqlite3 "$HOME/nyx-lookup/saved.db" -cmd "$1" || true
}
sqlite_delete() {
	# sqlite_exec "DELETE FROM whatsapp WHERE rawPhone = '$1'; DELETE FROM telegram WHERE phone = '$1';"
	sqlite_exec "DELETE FROM telegram WHERE phone = '$1';"
}
sqlite_select() {
	# sqlite_exec "SELECT * FROM whatsapp AS wa FULL JOIN telegram AS tg ON wa.rawPhone = tg.phone WHERE tg.phone = '$1';"
	sqlite_exec "SELECT * FROM telegram WHERE phone = '$1';"
}


sleep_random() {
	# Sleep for a random time between 2.5 and 7.5 seconds to avoid rate limiting
	sleep 2.6
}

mkdir -p "$HOME/nyx-lookup"
touch "$HOME/nyx-lookup/saved.db"

@test "env" {
	[ -f ".env" ]
	[ -f ".env.txt" ]
}

@test "help" {
	output="$(node index.js -h)"
	[ "${#output}" -gt 800 ]
}

real_version="$(grep '"version": "[0-9a-z.-]*"' ./package.json | sed -E 's/.*"version": "([a-z0-9.-]*)".*/\1/')"
latest_version="$(npm view nyx-lookup version)"

@test "version - latest" {
	echo "Latest version: $latest_version"
	sed -i "s/\"version\": \"[a-z0-9.-]*\"/\"version\": \"$latest_version\"/" ./package.json
	output="$(node index.js -v)"
	[[ "${output}" != *"Latest:"* ]]
}

@test "version - outdated" {
	sed -i 's/"version": "[a-z0-9.-]*"/"version": "1.0.0"/' ./package.json
	output="$(node index.js -v)"
	[[ "${output}" == *"Latest:"* ]]
	sed -i "s/\"version\": \"[a-z0-9.-]*\"/\"version\": \"$real_version\"/" ./package.json
}

@test "phone lookup - inital" {
	source "$env_path"
	sqlite_delete "$PHONE_TEST"

	output="$(node index.js --test --force --save --format=text)"
	[ "${#output}" -gt 400 ]

	output="$(sqlite_select "$PHONE_TEST")"
	[ "${#output}" -gt 40 ]
}

sleep_random

# API_TELEGRAM_TOKEN=""

# @test "clean" {
# 	cp -r "$cache_dir" "$cache_test"

# 	output="$(node index.js --clean)"
# 	[ -z "$output" ] # No output expected
# 	[ ! -d "$cache_dir/auth" ]

# 	mv "$cache_test" "$cache_dir"
# 	# source "$env_path"
# 	# [ -z "$API_TELEGRAM_TOKEN" ]
# }

@test "phone lookup - not logged in - cached data" {
	# mv "$env_path" "$env_test"
	# touch "$env_path"

	output="$(node index.js ${PHONE_TEST} --test --format=text)"
	[ "${#output}" -gt 300 ]
}

# @test "phone lookup - not logged in - force query" {
# 	output="$(node index.js ${PHONE_TEST} --test --force --format=text || true)"
# 	[ "${#output}" -lt 100 ]
# }

# sleep_random

@test "phone lookup - logged in" {
	# mv "$cache_test" "$cache_dir"
	# mv "$env_test" "$env_path"

	# API_TELEGRAM_TOKEN=""
	# source "$env_path"
	# [ -n "$API_TELEGRAM_TOKEN" ]

	output="$(node index.js --test --force --format=text)"
	[ "${#output}" -gt 450 ]
}

sleep_random
