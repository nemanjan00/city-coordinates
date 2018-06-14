const fs = require("fs");
const request = require("request");

fs.readdirSync("./sources").map(file => {
	return {
		code: file.split(".")[0], 
		data: require("./sources/"+file).municipalities
	};
}).filter((value, key) => {
	return key < 1;
}).map(list => {
	return new Promise(resolve => {
		const promises = list.data.map(municipality => {
			return new Promise(() => {
				request("https://nominatim.openstreetmap.org/search/belgrade?format=jso://nominatim.openstreetmap.org/search/" + encodeURI(municipality) + "?format=json", (error, response, body) => {
					console.log(body);
				});
			});
		});
	});
});



