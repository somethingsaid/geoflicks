// Global variables
var inputLocation = "";
var photoAlbum = [];
var flickrPage = 1;
var accuracy = 16; //default accuracy.  random search will lower accuracy (lower number)
var radius = 5; //default radius.  random search will expand search radius (higher number)
var geoCoordinates = [51.508742, -0.120850];
var randList = ["Labuan Bajo, Komodo", "New York City, New York", "Paris, France", "Halstatt, Austria", "Sucre, Bolivia", "Bhutan", "Otaru, Hokkaido"];
var googleApiKey = "AIzaSyBbLnfemMfCf7sJ83aiYAzb8-HR7nJAoOE";
var flickrApiKey = "05b7506e3fd86ae08a540a59e4e7f40d";
var map;
var mapShown = false;
// Functions
function initMap() {
    var mapProp = {
        center: new google.maps.LatLng(geoCoordinates[0], geoCoordinates[1]),
        zoom: 11,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('map'), mapProp);
    
    // Place new marker on click
    google.maps.event.addListener(map, 'click', function(event) {
        placeMarker(event.latLng);
        geoCoordinates = [Number(event.latLng.lat()), Number(event.latLng.lng())];
        console.log("New click coordinates: " + geoCoordinates);
        // Kick off photosearch on click:
        $("#album").empty();
        $(".fail").hide();
        $(".success").hide();
        $(".loading").show();
        $("#next-page").addClass("disabled");
        getPhoto(geoCoordinates);
    });
}

function placeMarker(location) {
    var marker = new google.maps.Marker({
        position: location,
        map: map,
    });
    
    var infowindow = new google.maps.InfoWindow({
        content: 'Lat: ' + Number(location.lat()).toFixed(4) + '<br>Lng: ' + Number(location.lng()).toFixed(4)
    });
    
    infowindow.open(map, marker);
}

function loadScript() {
    var script = document.createElement("script");
    script.src = "http://maps.googleapis.com/maps/api/js?key=" + googleApiKey + "&callback=initMap";
    document.body.appendChild(script);
}

function showPhoto(album) {
    var albumIndex = 0;
    var htmlString = "";
    while (albumIndex < album.length) {
        htmlString += "<div class='frame'><a target='_blank' href='" + album[albumIndex].flickrPage + "'><img class='img-thumbnail' src='" + album[albumIndex].url + "'></a></div>";
        albumIndex += 1;
    }
    $("#album").append(htmlString);
    $(".loading").hide();
    $("#next-page").removeClass("disabled");
    $(".success").show().css("color", "#3cba54");
}

function getPhoto(coord) {
    // flickr api key:
    console.log("ready to hit flickr");
    var parameters = {
        format: "json",
        method: "flickr.photos.search",
        api_key: flickrApiKey,
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
        per_page: 15, // defaults to 100, max 500 per page
        page: flickrPage,
        extras: "url_c, url_m, url_z"
    };
    
    $.ajax({
        url:  "https://api.flickr.com/services/rest/",
        type: "GET",
        data: parameters
    })
    .done(function(result){
        console.log(result);
        photoAlbum = []; // re-initialize
        $.each(result.photos.photo, function(i, photoObj){
            // photo is an array of objects, feed index and matching object
            var photoDetails = {
                title: photoObj.title,
                url: photoObj.url_z,
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
            $(".fail").show();
        }
    })
}

function getGeocode(location){
    var parameters = {
        key: googleApiKey,
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
            initMap();
            console.log(location + ": " + geoCoordinates);
            getPhoto(geoCoordinates);
        }
        else {
            console.log("no results");
            $(".loading").hide();
            $(".fail").show();
        }
    })
    .fail(function(jqXHR, error){
        console.log("call failed");
    });
}

/******************************************************************/
/* Execute when page finishes loading */
/******************************************************************/
$(document).ready(function(){
    console.log("Current date: " + moment().format('YYYY-MM-DD 00:00:00'));
    console.log("6 months ago: " + moment().subtract(6, "months").format('YYYY-MM-DD 00:00:00'));
    $("#next-page").addClass("disabled");
    /*************************************
    // Event listeners and actions
    **************************************/
    loadScript();
    // Get user's location input
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
        accuracy = 16;
        radius = 5;
        getGeocode(inputLocation);
        $("#next-page").addClass("disabled");
    });


    // User wants to see more results for same location
    $("#next-page").click(function(){
        if ($("#next-page").hasClass("disabled")) {
            ;
        }
        else{
            flickrPage += 1;
            console.log("show next batch of results for same location: " + inputLocation);
            $("#album").empty();
            $(".fail").hide();
            $(".success").hide();
            $(".loading").show();
            $("#next-page").addClass("disabled");
            getPhoto(geoCoordinates);
        }
    });

    // Show photos from random pick of preset list of locations
    $("#lucky").click(function(){
        $("#album").empty();
        $(".fail").hide();
        $(".success").hide();
        $(".loading").show();
        $("#next-page").addClass("disabled");
        accuracy = 8;
        radius = 30;

        // Fake randomization:
        inputLocation = randList[Math.floor(Math.random() * (randList.length))];
        console.log("Random location is: " + inputLocation);
        getGeocode(inputLocation);
    });

    // Search option toggle
    $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $(".navigation-search").toggleClass("toggled");
        initMap(); 
    });
//EOF
});