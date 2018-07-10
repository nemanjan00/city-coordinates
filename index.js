const fs = require("fs");

const googleMapsClient = require("@google/maps").createClient({
	key: process.env["GOOGLE_TOKEN"]
});

const responses = [];

const db = require("./db.json");
const cache = {};

let count = 0;

let i = 0;

db.forEach((list) => {
	list.forEach((municipality) => {
		if(municipality.lat){
			cache[municipality.country + municipality.municipality] = municipality;

			i++;
		}
	});
});

console.log(i);

fs.readdirSync("./sources").map(file => {
	return {
		code: file.split(".")[0], 
		data: require("./sources/"+file).municipalities
	};
}).filter((value, key) => {
	return key > -1;
	//return key < 1;
}).map(list => {
	return new Promise(resolve => {
		const promises = list.data.map(municipality => {
			return new Promise((resolve) => {
				if(cache[list.code + municipality]){
					console.log("cache hit");

					count++;

					resolve(cache[list.code + municipality]);

					return;
				}

				googleMapsClient.geocode({
					address: municipality + ", " + list.code
				}, function(err, response) {
					if (!err) {
						const result = {
							country: list.code,
							municipality: municipality,
							lat: (response.json.results[0] || {geometry: {location: {lat: undefined}}}).geometry.location.lat,
							lng: (response.json.results[0] || {geometry: {location: {lng: undefined}}}).geometry.location.lng
						};

						console.log(count);

						count++;

						resolve(result);
					} else {
						console.log(err);
						const result = {
							country: list.code,
							municipality: municipality,
						};

						console.log(count);

						resolve(result);
					}
				});
			});
		});

		resolve(Promise.all(promises));
	});
}).map((list) => {
	responses.push(list);
});

Promise.all(responses).then((list) => {
	fs.writeFileSync("./db.json", JSON.stringify(list));
	console.log(count);
});

