# Angular Bound Charts v 0.3.0

__Customisable SVG charts with live data & settings, completely bound to AngularJS with no other dependencies__

This is a reasonably new project (with only myself working on it currently), but I plan on keeping it updated, improving performance & will be adding tests & extensive documentation shortly.

Feel free to fork or give suggestions for features. Constructive criticism is welcome.

### [Demo](http://jakesidsmith.github.io/abc/)

## Getting started

These instructions apply to an application setup using [Yeoman](http://yeoman.io/) but can easily be adjusted to your needs.

1. First you'll have to add ABC to your `bower.json`, I'd suggest pinning a specific version using `=`.
The version at the time of writing this is `0.3.0`.

        "dependencies": {
            ...
            "angular-abc": "=0.3.0"
            ...
        }

2. You'll need to reference the main ABC javascript file in your `index.html` like so:

        <script src="bower_components/angular-abc/scripts/abc.js"></script>

3. This will also need referencing in your main javascript file (e.g. `app.js`)

        angular.module('myApp', [
            ...
            'angularAbc'
            ...
        ])

4. Now we have to adjust our `gruntfile.js` to copy the views (e.g. `abc.html`) to a location where they can be loaded after your application has been built & deployed. In my application it looks something like this:

        copy: {
            abc: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/bower_components/angular-abc/views/',
                    dest: '<%= yeoman.dist %>/bower_components/angular-abc/views/',
                    src: '*.html',
                flatten: true
                }]
            }
        }

5. I then call `copy:abc` in my build task just after `copy:dist`

        grunt.registerTask('build', [
            ...
            'copy:dist',
            'copy:abc',
            ...
        ]);

6. If you plan on running any tests using karma you'll have to include ABC in your `karma.conf.js` file

        files: [
          ...
          'bower_components/angular-abc/scripts/abc.js',
          ...
        ],

## Implementation

1. Prepare your data to use with ABC. I'd recommend using the ABC service to transform your data.

        app.controller('MainCtrl', ['$scope', 'ABC', function ($scope, ABC) {

            ...

            $scope.myChart = {
                data: ABC.transformData($scope.data),
                headers: ABC.transformHeaders($scope.data)
            }

            ...

        });


2. Add the ABC element with a data attribute linking to your transformed data / ABC settings.

        <abc data="myChart"></abc>

3. Tune the settings to your liking. The following settings are all optional.

        $scope.myChart = {

            // Classes for styling
            class: 'abc-chart',
            focusClass: 'abc-focus',
            nofocusClass 'abc-nofocus',

            // These hovering indices are used to focus on data from outside ABC
            hovering: {
                x: -1,
                y: -1
            },

            // Size settings
            width: 800,
            height: 200,
            resize: {
                width: true,
                height: false
            },

            // Element styling
            margin: 12,
            lineWidth: 2,
            axisLineWidth: 1,
            axisTickWidth: 1,
            axisTickSize: 4,
            pointSize: 2.5,
            pointHoverSize: 4,

            // Axis options
            xAxisLabelOffset: 0.5, // Offset by 0.5 ticks

            // Chart colors
            colors: ['#d24949', '#e59648', '#4f8f47', '#316e93', '#684c8a'],

            // Regions
            regions: [
              {
                start: 0,
                end: 1,
                color: 'red',
                title: 'Region 1',
                size: 12,
                titleY: 'top' // 'top', 'center', 'bottom', or number e.g. 0.5 (half) or 0.75 (3 quarters)
              }
            ],

            // Bands
            bands: [
              {
                start: 0, // Start & end can be exact values
                end: 'bottom', // Start & End can be 'top' or 'bottom'
                color: 'red',
                title: 'Lower band',
                size: 10
              }
            ],

            // Text transforms
            transforms: {
                yLabels: function,
                xLabels: function,
                popupLabels: function,
                popupValues: function
            }

            // Title settings
            title: {
                content: 'My Chart',
                size: 12,
                margin: 4,
                align: 'center' // center, left or right
            },

            // Transformed data & headers
            data: ABC.transformData($scope.data),
            headers: ABC.transformHeaders($scope.data)
        }
