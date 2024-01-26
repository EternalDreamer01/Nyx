import { exec } from "child_process";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import "./utils/proto.js";

export const pwd = dirname(fileURLToPath(import.meta.url));


export const Search = name => (
	new Promise(async resolve => (
		exec(`${pwd}/instagram/search.sh ${encodeURIComponent(name)}`, (_, stdout) => { console.log(typeof stdout, stdout); resolve(stdout.toJson()?.data?.xdt_api__v1__fbsearch__topsearch_connection?.users); })
	)));
export const Get = name => (
	new Promise(async resolve => (
		exec(`${pwd}/instagram/get.sh ${encodeURIComponent(name)}`, (_, stdout) => { console.log(typeof stdout, stdout); resolve(stdout.toJson()?.data?.user); })
	)));