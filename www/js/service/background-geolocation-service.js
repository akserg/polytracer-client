angular.module('client')

.service('BackgroundGeolocationService', ['$cordovaGeolocation', 'FIREBASE_URL',
  function ($cordovaGeolocation, FIREBASE_URL) {

    /**
    * @private BackgroundGeolocation plugin reference
    */
    var $plugin;

    function configurePlugin(bgGeoPlugin) {
      $plugin = bgGeoPlugin;
    }

    function start(deviceId, callback, faultback) {
      if ($plugin) {

        // The app must execute AT LEAST ONE call for the current position via standard Cordova geolocation,
        //  in order to prompt the user for Location permission.
        $cordovaGeolocation.getCurrentPosition({
          timeout: 10000,
          enableHighAccuracy: false
        }).then(function (position) {
          callback(position.coords);
        }, function (err) {
            faultback(err);
        });

        /**
         * This would be your own callback for Ajax-requests after POSTing background geolocation to your server.
         */
        var yourAjaxCallback = function(response) {
          ////
          // IMPORTANT:  You must execute the #finish method here to inform the native plugin that you're finished,
          //  and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
          // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
          //
          //
          $plugin.finish();
        };

        /**
         * This callback will be executed every time a geolocation is recorded in the background.
         */
        var callbackFn = function(location) {
          console.log('[js] BackgroundGeoLocation callback:  ' + location.latitude + ',' + location.longitude);
          // Do your HTTP request here to POST location to your server.
          callback(location);
          //
          yourAjaxCallback.call(this);
        };

        var failureFn = function(error) {
          console.log('BackgroundGeoLocation error');
          faultback(error);
        }

        var url = FIREBASE_URL + '/devices/' + deviceId + '.json';
        console.log('URL: ' + url);

          // BackgroundGeoLocation is highly configurable.
        $plugin.configure(callbackFn, failureFn, {
          //*************** ANDROID ***************
          url: url, // <-- Android ONLY:  your server url to send locations to
          notificationTitle: 'Background tracking', // <-- android only, customize the title of the notification
          notificationText: 'ENABLED', // <-- android only, customize the text of the notification
          //
          desiredAccuracy: 0,
          stationaryRadius: 10,
          distanceFilter: 10,
          activityType: 'AutomotiveNavigation',
          debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
          stopOnTerminate: true // <-- enable this to clear background location settings when the app terminates
        });
        console.log('Started');
        $plugin.start();
      }
    }

    function changePace(value) {
      if ($plugin) {
        $plugin.changePace(value);
      }
    }

    // Stop Background Geolocation
    function stop() {
      if ($plugin) {
        console.log('Stopped');
        $plugin.stop();
      }
    }

    return {
      start: start,
      stop: stop,
      changePace: changePace,
      configurePlugin: configurePlugin
    };
}]);