import { ServerResponse } from "http";

ServerResponse.prototype.html = function ({ status = 200, title = "Venom", content }) {
	return this.status(status).send(`<!DOCTYPE html>
	<html lang="en-UK">
	<head>
		<meta charset="UTF-8">
		<link rel="stylesheet" type="text/css" href="/style.css" media="all" />
		<title>${title}</title>
	</head>
	<body>
		<h1>${title}</h1>
		${content}
	</body>
	</html>`);
}
