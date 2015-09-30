angular.module('client')

.service('GeolocationService', ['$cordovaGeolocation', '$cordovaDeviceOrientation', 
	function ($cordovaGeolocation, $cordovaDeviceOrientation) {

    var geolocation, orientation;
    var callback, callback2, faultback;

    function configure(callbackIn, callbackIn2, faultbackIn) {
      callback = callbackIn;
      callback2 = callbackIn2;
      faultback = faultbackIn;
    }

    // Star background Geolocation
    function start() {
		  // The app must execute AT LEAST ONE call for the current position via standard Cordova geolocation,
      //  in order to prompt the user for Location permission.
      $cordovaGeolocation.getCurrentPosition({
          timeout: 10000,
          enableHighAccuracy: true
      })
      .then(function (position) {
      	callback(position.coords);
      }, function (err) {
          faultback(err);
      });

      // Remembed heading to update next time
			geolocation = $cordovaGeolocation.watchPosition({
        enableHighAccuracy: false,
        maximumAge: 5000,
        timeout: 10000
      });

      geolocation.then(null, function (err) {
          faultback(err);
      }, function (position) {
        console.log('Coords: ' + position.coords);
        callback(position.coords);
      });
      //
      // try {
      //   orientation = $cordovaDeviceOrientation.watchHeading({
      //     frequency: 3000,
      //     filter: true
      //   });

      //   orientation.then(null, function (err) {
      //     faultback(err);
      //   }, function (result) {
      //     if (result && result.heading) {
      //       callback2(result.heading);
      //     }
      //   });
      // } catch (err) {
      //   faultback(err);
      // }
  	}

    // Stop Background Geolocation
  	function stop() {
      if (geolocation) {
  		  geolocation.clearWatch();
        geolocation = null;
      }
      // if (orientation) {
      //   orientation.clearWatch();
      //   orientation = null;
      // }
  	}

  	return {
  		start: start,
  		stop: stop,
      configure: configure
  	};

}]);
