angular.module('client')

.controller('AppCtrl', ['$scope', 'LoadingService', '$ionicPlatform', 'DeviceService', '$ionicPopup', 'Toast', '$cordovaClipboard', 'BackgroundGeolocationService', 'FencingService',
  function($scope, LoadingService, $ionicPlatform, DeviceService, $ionicPopup, Toast, $cordovaClipboard, BackgroundGeolocationService, FencingService) {

    $scope.device = {};
    $scope.config = {
        aggressive: false
    };

    LoadingService.show('Discovering Your Device...');

    $ionicPlatform.ready(function () {
      // Try to get device ID saved on device to start tracking
      DeviceService.get().then(function($device) {
          startTracking($device);
      }).finally(function() {
          LoadingService.hide();
      });
    });

    // Start tracking of specified device
    function startTracking($device) {
        console.log('start tracking');
        $scope.device = {};
        $device.$bindTo($scope, 'device');
        $scope.deviceKey = $device.$id;
        // Keep it to unbund later
        $scope.$device = $device;
        //
        BackgroundGeolocationService.start($device.$id, savePosition, errorHandler);
        BackgroundGeolocationService.changePace($scope.config.aggressive);
        //
        startWatchFencing($scope.deviceKey);
    };

    // Update comes for IOS devices only
    function savePosition(position) {
        $scope.device.timestamp = Firebase.ServerValue.TIMESTAMP;
        if (!$scope.device.location) {
            $scope.device.location = {};
        }
        $scope.device.location.latitude = position.latitude;
        $scope.device.location.longitude = position.longitude;
        $scope.device.location.speed = position.speed;
        $scope.device.location.accuracy = position.accuracy;
        $scope.device.location.bearing = position.heading;
        //
        checkFencings($scope.device);
    }

    function errorHandler(err) {
        console.log('unable to find location: ' + err.message ? err.message : err);
        Toast.show(err.message ? err.message : err, 'short', 'bottom');
    }

    // Enable geolocation tracking
    $scope.enable = function () {
        DeviceService.create($scope.device.name).then(function() {
            DeviceService.get().then(function($device) {
                startTracking($device);
            });
        });
    };

    // Stop geolocation and gelete device info
    $scope.reset = function () {
      $ionicPopup.confirm({
        title: 'About Reset Device Info',
        template: 'Are you sure?'
      }).then(function(res) {
        if(res) {
          // Must be deleted
          DeviceService.reset().then(function () {
              stopWatchFencing($scope.deviceKey);
              // Stop geolocation
              BackgroundGeolocationService.stop();
              // This one cancels event listeners and frees memory used by this object (deletes the local data).
              $scope.$device.$destroy();
              // Clean references in UI
              $scope.deviceKey = null;
              $scope.device = {};
              // 
              Toast.show('Information was reset', 'short', 'bottom');
            });
          }
      });
    };

    $scope.updateAggresive = function() {
        BackgroundGeolocationService.changePace($scope.config.aggressive);
    };

    $scope.copyToClipboard = function() {
      try {
          $cordovaClipboard.copy($scope.deviceKey).then(function() {
            Toast.show('Device number was copied to Clipboard', 'short', 'bottom');
      }, function(error) {
            Toast.show(error.message ? error.message : error, 'short', 'bottom');
        });
      } catch (error) {
        Toast.show(error.message ? error.message : error, 'short', 'bottom');
      }
    };

    //********
    // Fencing
    //********
    $scope.$fencings = [];
    function startWatchFencing(deviceId) {
      $scope.$fencings = FencingService.fencings(deviceId);
    }

    function checkFencings($device) {
      angular.forEach($scope.$fencings, function($fencing, key) {
        if (check($device, $fencing)) {
          // inside
        } else {
          // outside
        }
      }, this);
    }

    function stopWatchFencing(deviceId) {
      $scope.$fencings = [];
    }

    function check($device, $fencing) {
      return true;
    }

}]);