$(document).ready(function(){
console.log("Current date: " + moment().format('YYYY-MM-DD 00:00:00'));
console.log("6 months ago: " + moment().subtract(6, "months").format('YYYY-MM-DD 00:00:00'));
// Global variables
var inputLocation = "";

// Functions
function getPhoto(coord) {
	// insta key: 42711593.81734e3.689a6cf94b2a4fcb926cca41dff033a1
	// flickr api key:
	var parameters = {
		method: "flickr.photos.search",
		api_key: "05b7506e3fd86ae08a540a59e4e7f40d",
		sort: "interestingness_desc", //optional, defaults to date-posted-desc,
		accuracy: 12, // range [1: 16] where 1 is world, 16 is street, 11 is around city
		min_taken_date: moment().subtract(6, "months").format('YYYY-MM-DD 00:00:00'),
		max_taken_date: moment().format('YYYY-MM-DD 00:00:00'),
		lat : coord[0], // e.g. 33.7734897
		lon : coord[1], // e.g. -116.3404429
		radius: 10, // range (0: 32] km
		radius_units: "km",
	};

    $.ajax({
    	url:  "https://api.flickr.com/services/rest/",
    	type: "GET",
    	data: parameters,
    	dataType: "jsonp"
    })
    .done(function(result){
	console.log(result);
    });
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
})
});