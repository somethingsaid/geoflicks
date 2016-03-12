$(document).ready(function(){

// Global variables
var inputLocation = "";
var geoCoordinates = [];

// Functions
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
    	console.log("call successful");
    	console.log(result);
    })
    .fail(function(jqXHR, error){
    	console.log("call failed");
    });
}

function getPhoto(coord) {
	var latitude = coord[0];
	var longitude = coord[1];
}
// Event listeners
$(".location-getter").submit(function(event){
	event.preventDefault();
	inputLocation = $(this).find("input[name='location']").val();
	console.log("user entered: " + inputLocation);
	getGeocode(inputLocation);
})
});