$(document).ready(function(){
console.log("Current date: " + moment().format('YYYY-MM-DD 00:00:00'));
console.log("6 months ago: " + moment().subtract(6, "months").format('YYYY-MM-DD 00:00:00'));
// Global variables
var inputLocation = "";

// Functions

function getPhoto(coord) {
	// insta key: 42711593.81734e3.689a6cf94b2a4fcb926cca41dff033a1
	// flickr api key:
	console.log("ready to hit flickr");
	var parameters = {
		format: "json",
		method: "flickr.photos.search",
		api_key: "05b7506e3fd86ae08a540a59e4e7f40d",
		//sort: "interestingness_desc", //optional, defaults to date-posted-desc,
		accuracy: 12, // range [1: 16] where 1 is world, 16 is street, 11 is around city
		min_taken_date: moment().subtract(6, "months").format('YYYY-MM-DD 00:00:00'),
		max_upload_date: moment().format('YYYY-MM-DD 00:00:00'),
		lat : coord[0], // e.g. -23.8634189
		lon : coord[1], // e.g. -69.1328491
		radius: 10, // range (0: 32] km
		radius_units: "km",
		per_page: 5, // defaults to 100, max 500 per page
		extras: "url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o"
	};
    
	$.ajax({
    	url:  "https://api.flickr.com/services/rest/",
    	type: "GET",
    	data: parameters
    });
}

var jsonFlickrAPI = function(rsp){
	console.log(rsp);
}

function getGeocode(location){
	var parameters = {
		key: "AIzaSyBbLnfemMfCf7sJ83aiYAzb8-HR7nJAoOE",
		address: location
	};

    $.ajax({
    	url: "https://maps.googleapis.com/maps/api/geocode/json",
    	type: "GET",
        data: parameters
    })
    .done(function(result){
    	console.log(result);
    	var geoCoordinates = [];
    	geoCoordinates.push(result.results[0].geometry.location.lat);
    	geoCoordinates.push(result.results[0].geometry.location.lng);
    	console.log(location + ": " + geoCoordinates);
    	getPhoto(geoCoordinates);
    })
    .fail(function(jqXHR, error){
    	console.log("call failed");
    });
}


// Event listeners
$(".location-getter").submit(function(event){
	event.preventDefault();
	inputLocation = $(this).find("input[name='location']").val();
	console.log("user entered: " + inputLocation);
	getGeocode(inputLocation);
    });
});