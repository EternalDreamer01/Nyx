#!./test/bats/bin/bats

prog="nyx-lookup"


@test "help" {
	output="$(node index.js -h)"
	[ -n "$output" ]
	[ "${#output}" -gt 800 ]
}

real_version="$(grep '"version": "[0-9a-z.-]*"' ./package.json | sed -E 's/.*"version": "([a-z0-9.-]*)".*/\1/')"
latest_version="$(npm view nyx-lookup version)"

@test "version - latest" {
	echo "Latest version: $latest_version"
	sed -i "s/\"version\": \"[a-z0-9.-]*\"/\"version\": \"$latest_version\"/" ./package.json
	output="$(node index.js -v)"
	[ -n "$output" ]
	[[ "${output}" != *"Latest:"* ]]
}

@test "version - outdated" {
	sed -i 's/"version": "[a-z0-9.-]*"/"version": "1.0.0"/' ./package.json
	output="$(node index.js -v)"
	[ -n "$output" ]
	[[ "${output}" == *"Latest:"* ]]
	sed -i "s/\"version\": \"[a-z0-9.-]*\"/\"version\": \"$real_version\"/" ./package.json
}

@test "phone lookup - inital" {
	output="$(node index.js --test --format=text)"
	[ -n "$output" ]
	[ "${#output}" -gt 450 ]
}

API_TELEGRAM_TOKEN=""
cache_dir="$HOME/.cache/nyx-lookup"
cache_test="$HOME/.cache/nyx-lookup-test"
env_path="./.env"
env_test="./.env.test"

@test "clean" {
	# cp -r "$cache_dir" "$cache_test"
	cp "$env_path" "$env_test"

	output="$(node index.js --clean)"
	[ -z "$output" ] # No output expected
	# [ ! -d "$cache_dir/auth" ]
	source "$env_path"
	[ -z "$API_TELEGRAM_TOKEN" ]
}


@test "phone lookup - not logged in" {
	output="$(node index.js --test --format=text)"
	[ "${#output}" -lt 100 ]
}

@test "phone lookup - logged in" {
	# rm -rf "$cache_dir" "$env_path"
	# mv "$cache_test" "$cache_dir"
	mv "$env_test" "$env_path"

	API_TELEGRAM_TOKEN=""
	source "$env_path"
	[ -n "$API_TELEGRAM_TOKEN" ]

	output="$(node index.js --test --format=text)"
	[ -n "$output" ]
	[ "${#output}" -gt 450 ]
}
