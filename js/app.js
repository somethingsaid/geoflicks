$(document).ready(function(){
console.log("Current date: " + moment().format('YYYY-MM-DD 00:00:00'));
console.log("6 months ago: " + moment().subtract(6, "months").format('YYYY-MM-DD 00:00:00'));
// Global variables
var inputLocation = "";

// Functions

function getPhoto(coord) {
	// flickr api key:
	console.log("ready to hit flickr");
	var parameters = {
		format: "json",
		method: "flickr.photos.search",
		api_key: "05b7506e3fd86ae08a540a59e4e7f40d",
		nojsoncallback: 1,  // return raw JSON instead of JSONP
        lat : coord[0],
		lon : coord[1],
		/* optional parameters: */
		content_type: 1, // 1 for photos only
		sort: "relevance", //optional
		accuracy: 13, // range [1: 16] where 1 is world, 16 is street, 11 is around city
		min_taken_date: moment().subtract(12, "months").format('YYYY-MM-DD 00:00:00'),
		max_upload_date: moment().format('YYYY-MM-DD 00:00:00'),
		radius: 10, // range (0: 32] km
		radius_units: "km",
		per_page: 30, // defaults to 100, max 500 per page
		extras: "url_t, url_s, url_m, url_z"
	};
    
	$.ajax({
    	url:  "https://api.flickr.com/services/rest/",
    	type: "GET",
    	data: parameters
    })
    .done(function(result){
    	console.log(result);
    	//https://www.flickr.com/photos/{user-id}/{photo-id} - individual photo
    	$.each(result.photos.photo, function(i, photoObj)
    		// photo is an array of objects, feed index and matching object
    	{
    		console.log(photoObj);
    		console.log("Title: " + photoObj.title);
    		console.log("Source URL: " + photoObj.url_m);
    		console.log("Link to flickr: https://www.flickr.com/photos/" + photoObj.owner + "/" + photoObj.id);
    		console.log("*******************************");
    	});
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