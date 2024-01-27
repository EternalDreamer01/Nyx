Object.prototype.filter = function(words /* to keep */) {
	return Object.entries(this)
			.filter(([key]) => words.includes(key))
			.reduce((prev, curr) => ({ ...prev, [curr[0]]: curr[1] }), {});
}

Array.prototype.filterObject = function(words /* to keep */) {
	return this.map(obj => obj.filter(words));
}

Array.prototype.filterFn = function(callback = null) {
	return this.map(callback);
}


String.prototype.toJson = function() {
	try {
		return JSON.parse(this);
	}
	catch(error) {
		return { error };
	}
}