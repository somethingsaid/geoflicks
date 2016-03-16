$(document).ready(function(){
console.log("Current date: " + moment().format('YYYY-MM-DD 00:00:00'));
console.log("6 months ago: " + moment().subtract(6, "months").format('YYYY-MM-DD 00:00:00'));

// Global variables
var inputLocation = "";
var photoAlbum = [];
var flickrPage = 1;
var accuracy = 11; //default accuracy.  random search will lower accuracy
var radius = 10; //default radius.  random search will expand search radius
var geoCoordinates = [];
var randList = ["Labuan Bajo, Komodo", "New York City, New York", "Paris, France", "Halstatt, Austria", "Sucre, Bolivia", "Bhutan", "Otaru, Hokkaido"];

// Functions
function randCoordinates() {
    randLat = Math.floor(Math.random() * (66.6 - (-33.3) + 1.0000)) + (-66.6); // +- world's pop distr. in 2000 by lat
    randLng = Math.floor(Math.random() * (145.3 - (-120.6) + 1.0000)) + (-120.6); // +- world's pop distr. in 2000 by lng
    geoCoordinates = [randLat, randLng];
    console.log("randomized location: " + geoCoordinates);
}

function showPhoto(album){
	var albumIndex = 0;
	var htmlString = "";
	while(albumIndex < album.length) {
        for(var row = 1; row < 5; row++){
        	if(albumIndex < album.length){
    	        htmlString += "<div class='row'>";
    	        for(var col = 1; col < 5; col++){
    	        	if(albumIndex < album.length){
    	        		/*
    		            var imgText = "<a target='_blank' href='" + album[albumIndex].flickrPage + "'>    </a>"; // <img src='" + album[albumIndex].url + "'>
    		            htmlString += "<div class='col-md-3' style='background-image:url(\"" + album[albumIndex].url + "\");background-size:cover;background-repeat:no-repeat;'>" + imgText + "</div>";
    		            */
    		            var imgText = "<a target='_blank' href='" + album[albumIndex].flickrPage + "'><img class='img-thumbnail' src='" + album[albumIndex].url + "' width='280' height='190'></a>";
    		            htmlString += "<div class='col-lg-3 col-md-4 col-sm-6 col-xs-12'>" + imgText + "</div>";
    		            albumIndex += 1;
    	            };
    	        };
    	    };
    	    htmlString += "</div>";
        };
    };
    $("#album").append(htmlString);
    $(".loading").hide();
    $("#next-page").show();
    $(".success").show().css("color", "#3cba54");
}

function getPhoto(coord){
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
		sort: "interestingness_desc", //can also be interestingness_desc, time based
		accuracy: accuracy, // range [1: 16] where 1 is world, 16 is street, 11 is around city
		min_taken_date: moment().subtract(12, "months").format('YYYY-MM-DD 00:00:00'),
		max_upload_date: moment().format('YYYY-MM-DD 00:00:00'),
		radius: radius, // range (0: 32] km
		radius_units: "km",
		per_page: 16, // defaults to 100, max 500 per page
		page: flickrPage,
		extras: "url_t, url_s, url_m, url_z"
	};
    
	$.ajax({
    	url:  "https://api.flickr.com/services/rest/",
    	type: "GET",
    	data: parameters
    })
    .done(function(result){
    	console.log(result);
    	photoAlbum = []; // re-initialize
    	$.each(result.photos.photo, function(i, photoObj)
    		// photo is an array of objects, feed index and matching object
    	{
    		var photoDetails = {
    			title: photoObj.title,
    			url: photoObj.url_m,
    			flickrPage: "https://www.flickr.com/photos/" + photoObj.owner + "/" + photoObj.id
    		}
    		photoAlbum.push(photoDetails);
    	});
    	console.log(photoAlbum);
    	if(photoAlbum.length > 0){
    	    showPhoto(photoAlbum);
    	}
    	else{
    		$(".loading").hide();
            $(".success").css("color", "red").show();
            $(".fail").show();
    	}
    })
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
    	if (result.results.length > 0){
            geoCoordinates = []; // re-setting coordinates
    	    geoCoordinates.push(result.results[0].geometry.location.lat);
    	    geoCoordinates.push(result.results[0].geometry.location.lng);
    	    console.log(location + ": " + geoCoordinates);
    	    getPhoto(geoCoordinates);
    	}
    	else {
    		console.log("no results");
    	}
    })
    .fail(function(jqXHR, error){
    	console.log("call failed");
    });
}


// Event listeners
$("#location-getter").submit(function(event){
	event.preventDefault();
	$("#album").empty();
	$(".fail").hide();
	$(".success").hide();
	$(".loading").show();
	// always show first page results when clicking submit
    flickrPage = 1;
	inputLocation = $(this).find("input[name='location']").val();
	console.log("user entered: " + inputLocation);
    accuracy = 11;
    radius = 10;
	getGeocode(inputLocation);
    $("#next-page").hide();
    });


// Clicking show-more
$("#next-page").click(function(){
    flickrPage += 1;
    console.log("show next batch of results for same location: " + inputLocation);
    $("#album").empty();
    $(".fail").hide();
    $(".success").hide();
    $(".loading").show();
    getPhoto(geoCoordinates);
});

// Clicking random
$("#lucky").click(function(){
    $("#album").empty();
    $(".fail").hide();
    $(".success").hide();
    $(".loading").show();
    $("#next-page").hide();
    accuracy = 8;
    radius = 30;
    // Need to create a while loop here - if flickr returns nothing, keep randomizing. but a simple while here will endlessly loop
    // due to time take for ajax call to return
    //randCoordinates();
    //getPhoto(geoCoordinates);

    /* Fake randomization:

    */
    inputLocation = randList[Math.floor(Math.random() * (randList.length))];
    console.log("Random location is: " + inputLocation);
    getGeocode(inputLocation);
});

// Menu toggle
$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled"); 
});

});