import React, { memo, useState } from 'react';
import axios from 'axios';
import ReactLoading from 'react-loading';
import './App.css';


const MinimalUserInfo = memo(({ firstName, lastName, full_name, username, name, picture, photo, profile_pic_url, profile_pic_url_hd }) => {
	const titleName = (() => {
		let title = "";
		if (typeof firstName === "string")
			title += firstName;
		if (typeof lastName === "string")
			title += lastName;
		if(title !== "")
			return title;
		return full_name || username || name;
	})();

	return (
		<li className="flex flex-row items-center">
			<img
				src={picture || photo || profile_pic_url_hd || profile_pic_url}
				alt={titleName}
				crossOrigin
				className='w-48 rounded-lg'
			/>
			<h3 className='w-18'>{titleName}</h3>
		</li>
	);
}, () => false);

const Network = memo(({ title, data }) => {
	const total = (() => {
		if (Array.isArray(data))
			return data.length;
		return typeof data === "object" && data !== null ? 1 : 0;
	})();

	return (
		<>
			<h2>{title} - {total === 0 ? "No" : total} result</h2>
			{
				total > 0 && (
					Array.isArray(data) ?
						data.map(user => <MinimalUserInfo {...user} />)
						:
						<MinimalUserInfo {...data} />
				)
			}
		</>
	)
}, () => false);

function App() {
	const [value, setValue] = useState("");
	const [result, setResult] = useState({});
	const [loading, setLoading] = useState(false);

	const submit = async ({ keyCode }) => {
		if (keyCode !== 13)
			return;
		setLoading(true);
		try {
			var type = "search";
			if (/^\+?[0-9 -]+$/.test(value))
				type = "phone";
			console.log(type);
			const { status, data } = await axios.get(`/${type}/${encodeURIComponent(value)}`);
			console.log(status, data);
			setResult(status === 204 ? { error: "No result. This person seems unknown" } : data);
		}
		catch (err) {
			setResult({ error: "Unknown error" });
		}
		setLoading(false);
	}


	return (
		<div className="App">
			<h1>Venom</h1>
			<input
				type="text"
				maxLength={80}
				onChange={e => setValue(e.target.value)}
				placeholder="Enter name, exact name or phone"
				onKeyDownCapture={submit}
			/>
			{
				loading &&
				<ReactLoading type="spin" color="white" height="10%" width="10%" />
			}
			{
				result &&
				(
					result.error !== undefined ?
						<p>{result.error}</p>
						:
						<ul>
							{
								Object.entries(result)
									.map(([title, data]) => (
										<Network title={title} data={data} />
									))
							}
						</ul>
				)
			}
		</div>
	);
}

export default App;
