var app = angular.module('client', ['ionic', 'ngCordova', 'ngCookies', 'ngStorage', 'firebase', 'LocalForageModule', 'monospaced.qrcode']);

// URL of Firebase DB
app.value('FIREBASE_URL', 'https://polytracer.firebaseio.com');

// Firebase singleton
app.factory('fbRef', ['FIREBASE_URL', function (FIREBASE_URL) {
    return new Firebase(FIREBASE_URL);
}]);

app.config(function ($stateProvider, $urlRouterProvider) {

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.when('', '/app/main');
    $urlRouterProvider.otherwise('/app/main');

    $stateProvider

    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/app.html',
        controller: 'AppCtrl'
    })

    .state('app.main', {
        url: '/main',
        views: {
            'menuContent': {
                templateUrl: 'templates/main.html',
                controller: 'MainCtrl'
            }
        }
    });
});

app.run(function ($ionicPlatform, BackgroundGeolocationService) {
    $ionicPlatform.ready(function () {

        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }

        if (window.cordova && window.BackgroundGeolocation) {
            BackgroundGeolocationService.configurePlugin(window.BackgroundGeolocation);
        }
    });
});
