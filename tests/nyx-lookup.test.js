/*******************************************************************************
 * @file      test.js
 * @brief     
 * @date      Mo May 2026
 * @author    Dimitri Simon
 * 
 * PROJECT:   nyx-lookup
 * 
 * MODIFIED:  Mon May 11 2026
 * BY:        Dimitri Simon
 * 
 * Copyright (c) 2026 Dimitri Simon
 * 
 *******************************************************************************/
jest.setTimeout(15000);

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const prog = 'nyx-lookup';
const HOME = process.env.HOME || process.env.USERPROFILE;
const cacheDir = path.join(HOME, '.cache', prog);
const cacheTest = path.join(HOME, '.cache', `${prog}-test`);
const envPath = path.resolve('./.env');
// const envTest = path.resolve('./.env.test');
const savedDbDir = path.join(HOME, prog);
const savedDb = path.join(savedDbDir, 'saved.db');
const packageJsonPath = path.resolve('./package.json');

function run(cmd, opts = {}) {
	try {
		return execSync(cmd, { encoding: 'utf8', stdio: 'pipe', timeout: 15000, ...opts });
	} catch (e) {
		// return stdout/stderr combined to emulate shell test behavior
		return (e.stdout || '') + (e.stderr || '');
	}
}

function sqliteExec(sql) {
	try {
		// echo ".exit" | sqlite3 "$HOME/$prog/saved.db" -cmd "$1" || true
		return run(`echo ".exit" | sqlite3 "${savedDb}" -cmd "${sql.replace(/"/g, '\\"')}"`);
	} catch (e) {
		return (e.stdout || '') + (e.stderr || '');
	}
}

function sqliteDelete(phone) {
	// delete from telegram only (as original)
	sqliteExec(`DELETE FROM telegram WHERE phone = '${phone}';`);
}

function sqliteSelect(phone) {
	return sqliteExec(`SELECT * FROM telegram WHERE phone = '${phone}';`);
}

function sleep(ms) {
	return new Promise((res) => setTimeout(res, ms));
}

beforeAll(() => {
	// ensure saved db exists
	if (!fs.existsSync(savedDbDir)) fs.mkdirSync(savedDbDir, { recursive: true });
	if (!fs.existsSync(savedDb)) fs.writeFileSync(savedDb, '');
});

describe('nyx-lookup CLI (converted from bats)', () => {
	test('env files exist', () => {
		expect(fs.existsSync(envPath)).toBe(true);
		expect(fs.existsSync(envPath + '.txt')).toBe(true);
	});

	test('help output (length)', () => {
		const output = run('node index.js -h');
		expect(output.length).toBeGreaterThan(800);
	});

	test('version - latest', () => {
		// read real version and latest from npm
		const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
		const realVersion = pkg.version;
		const latestVersion = run(`npm view ${prog} version`).trim();

		// set package.json to latest
		pkg.version = latestVersion;
		fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2));

		const output = run('node index.js -v');
		expect(output).not.toMatch(/Latest:/);

		// restore
		pkg.version = realVersion;
		fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2));
	});

	test('version - outdated', () => {
		const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
		const realVersion = pkg.version;

		// set to 1.0.0
		pkg.version = '1.0.0';
		fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2));

		const output = run('node index.js -v');
		// restore
		pkg.version = realVersion;
		fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2));

		expect(output).toMatch(/Latest:/);
	});

	test('phone lookup - initial', () => {
		const phoneTest = process.env.PHONE_TEST;
		if (!phoneTest) throw new Error('PHONE_TEST not set in .env');

		sqliteDelete(phoneTest);

		const output = run('node index.js --test --force --save --format=text');
		expect(output.length).toBeGreaterThan(400);

		const dbOut = sqliteSelect(phoneTest);
		expect(dbOut.length).toBeGreaterThan(40);
	});

	test('phone lookup - colour flags', () => {
		const phoneTest = process.env.PHONE_TEST;
		if (!phoneTest) throw new Error('PHONE_TEST not set in .env');
		// sqliteDelete(phoneTest);

		const output1 = run('node index.js --test --save --format=text');
		const output2 = run('node index.js --test --save --format=text --no-colour');
		const output3 = run('node index.js --test --save --format=text --colour');

		// console.log(output1.replace(/\x1b\[[0-9;]+m/g, ''), output2.replace(/\x1b\[[0-9;]+m/g, ''));
		expect(output1.length).toBeGreaterThan(400);
		expect(output1.length).toBe(output3.length); // default coloured
		// TODO: it shouldn't need to remove \x1b from output2
		expect(output1.replace(/\x1b\[[0-9;]+m/g, '').length).toBe(output2.replace(/\x1b\[[0-9;]+m/g, '').length);
	});

	// emulate sleep_random
	// test('sleep random (short)', async () => {
	// 	await sleep(1200); // original slept 1.2s
	// });

	test('phone lookup - not logged in - cached data', () => {
		const phoneTest = process.env.PHONE_TEST;
		if (!phoneTest) throw new Error('PHONE_TEST not set in .env');

		const output = run(`node index.js ${phoneTest} --test --format=text`);
		expect(output.length).toBeGreaterThan(300);
	});

	test('phone lookup - logged in', () => {
		const output = run('node index.js --test --force --format=text');
		expect(output.length).toBeGreaterThan(450);
	});
});
