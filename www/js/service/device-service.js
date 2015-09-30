angular.module('client')

.service('DeviceService', ['$localStorage', '$q', '$localForage', 'fbRef', '$firebaseObject', 
    function ($localStorage, $q, $localForage, fbRef, $firebaseObject) {

    // Get device Id from local storage
	function get() {
		var deferred = new $q.defer();

		$localForage.getItem('deviceKey').then(function (key) {
            if (key) {
                var $device = $firebaseObject(fbRef.child('devices/' + key));
                // We need wait until oject will be fully loaded
                $device.$loaded().then(function () {
                    // Now device is ready to use
                    deferred.resolve($device);
                }).catch(function (error) {
                    // Something wrong
                    deferred.reject(err);
                });
            } else {
                deferred.reject('Device was not registered yet');
            }
        })
        .catch(function(err) {
        	deferred.reject(err);
        });

		return deferred.promise;
	}

    // Create new device in DB and save it in local storage
	function create(name) {
		var deferred = new $q.defer();
        // Create new device reference instance
        var device = fbRef.child('devices').push();
        //
        device.set({name: name}, function (err) {
            if (err) {
                deferred.reject(err);
            } else {
                var deviceId = device.key();
                $localForage.setItem('deviceKey', deviceId).then(function () {
                	deferred.resolve(deviceId);
            	}, function(err) {
            		deferred.reject(err);
            	});
            }
        });
        //
        return deferred.promise;
	}

    // Delete information about device from local storage
	function reset() {
		// TODO: Clear device info on Firebase
		return $localForage.clear();
	}

	return {
		get: get,
		create: create,
		reset: reset
	};
}]);
