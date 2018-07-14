var map;
var fortInfo = {};
var bounds = {};
// fort locations
var locations = [
    { title: 'Mahim Fort', location: { lat: 19.0421, lng: 72.8379 } },
    { title: 'Karnala Fort', location: { lat: 18.881111, lng: 73.118056 } },
    { title: 'Bandra Fort', location: { lat: 19.0419, lng: 72.8184 } },
    { title: 'Belapur Fort', location: { lat: 19.0049, lng: 73.0284 } },
    { title: 'Worli Fort', location: { lat: 19.0237, lng: 72.8168 } },
    { title: 'Sion Fort', location: { lat: 19.0466, lng: 72.8677 } },
    { title: 'Madh Fort', location: { lat: 19.135754, lng: 72.795319 } },
];
function plotMap() {
    // map initialization
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 19.0760, lng: 72.8777 },
        styles: styles,
        zoom: 0,
        mapTypeControl: false
    });
    fortInfo = new google.maps.InfoWindow();

    bounds = new google.maps.LatLngBounds();
    ko.applyBindings(new ViewModel());
}
// error handling
function googleMapsError() {
    alert('An error occurred with Google Maps!');
}
var fortMarkModel = function (fort) {
    this.position = fort.location;
    this.title = fort.title;
    var self = this;
    this.visible = ko.observable(true);

    // Maker creation
    var image = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';
    this.marker = new google.maps.Marker({
        position: this.position,
        title: this.title,
        animation: google.maps.Animation.DROP,
        map: map,
        icon: image
    });

    this.showMarker = ko.computed(function () {
        if (self.visible() === true) {
            self.marker.setMap(map);
            bounds.extend(self.marker.position);
            map.fitBounds(bounds);
        } else {
            self.marker.setMap(null);
        }
    });

    //#region get place information using facebook place api
    var FacebookPlaceApi = "https://graph.facebook.com/v3.0/search?"
        + "type=place&fields=name,location,picture,overall_star_rating&q=fort"
        + "&center=" + this.position.lat + "," + this.position.lng
        + "&access_token=899456256906258|OZh9Xb60XDsBQCXb_CvnRQf34Ag";
    this.fort = {
        fortname: '',
        fortImage: '',
        city: ''
    };
    $.getJSON(FacebookPlaceApi).done(function (response) {
        var palceInfo = response.data[0];
        self.fort = {
            fortname: palceInfo.name,
            fortImage: palceInfo.picture.data.url,
            city: palceInfo.location.city
        };
    }).fail(function () {
        alert(
            "Error occurred. Please refresh your page to try again."
        );
    });
    //#end region get place information using facebook place api

    // display details about the marker places
    function ShowFortInfo(marker, fort) {
        console.log(self.fort);
        var html = '<table><tr><td colspan="2"><b>' + self.fort.fortname + '</b></td></tr>'
            + '<tr><td><b>' + self.fort.city + '</b></td></tr>'
            + '<tr><td><img src="' + self.fort.fortImage + '" alt="' + self.fort.fortname + '"</td>'
            + '</table>';
        fortInfo.setContent(html);
        fortInfo.open(map, marker);
    }


    this.fortNameClick = function (fort) {
        google.maps.event.trigger(self.marker, 'click');
    };

    

    function toggleBounce() {
        if (self.marker.getAnimation() !== null) {
            self.marker.setAnimation(null);
        } else {
            self.marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function(){ self.marker.setAnimation(null); }, 850);
        }
    }

        this.marker.addListener('click', function () {
            ShowFortInfo(this, this.fort);
        });
        this.marker.addListener('click', function () {
            toggleBounce();
        });

    };
    //binds the data to the view
    var ViewModel = function () {
        var self = this;
        this.searchFort = ko.observable('');
        self.FortList = ko.observableArray([]);
        locations.forEach(function (location) {
            self.FortList.push(new fortMarkModel(location));
        });
        this.forPositionList = ko.computed(function () {
            var searchList = self.searchFort().toLowerCase();
            if (searchList) {
                return ko.utils.arrayFilter(self.FortList(), function (location) {
                    console.log(location.title);
                    var str = location.title.toLowerCase();
                    var result = str.includes(searchList);
                    location.visible(result);
                    return result;
                });
            }
            self.FortList().forEach(function (location) {
                location.visible(true);
            });
            return self.FortList();
        }, self);
        console.log(this.forPositionList());
    };



