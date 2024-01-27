import { exec } from "child_process";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import "./utils/proto.js";

export const pwd = dirname(fileURLToPath(import.meta.url));

// console.log(process.env);

export const Search = name => (
	new Promise(async resolve => (
		exec(`${pwd}/facebook/search.sh ${encodeURIComponent(name)}`, (_, stdout) => resolve(stdout.toJson()?.data?.search_keywords_suggestion?.suggestions?.edges))
	)));
/*
export const Get = name => (
	new Promise(async resolve => (
		exec(`${pwd}/instagram/get.sh ${encodeURIComponent(name)}`, (_, stdout) => resolve(stdout?.toJson()?.data?.user))
	)));
*/