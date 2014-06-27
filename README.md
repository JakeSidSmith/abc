# Angular Bound Charts

##### Customisable SVG charts with live data & settings, completely bound to AngularJS with no other dependencies

### [Demo](http://jakesidsmith.github.io/abc/)

This is a new project (with only myself working on it currently), but I plan on keeping it updated, improving performance & will be adding tests & documentation shortly.

Feel free to fork or give suggestions for features. Constructive criticism is welcome. :)

## Getting started

1. First you'll have to ABC to your `bower.json`, I'd suggest pinning a specific version using `=`.
The version at the time of writing this is `0.1.0`.

        "dependencies": {
            ...
            "angular-abc": "=0.1.0"
            ...
        }

2. You'll need to reference the main ABC javascript file in your `index.html` like so: 

        <script src="bower_components/angular-abc/scripts/abc.js"></script>

3. This will also need referencing in your main javascript file (e.g. `app.js`)

        angular.module('myApp', [
            ...
            'angularAbc'
            ...
        }

4. An extra step compared to most Angular modules is adjusting your `gruntfile.js` to copy the views (e.g. `abc.html`) to a location where they can be loaded after your application has been built & deployed. In my application it looks something like this:

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
        
5. I then call this is my build task just after `copy:dist`

        grunt.registerTask('build', [
            ...
            'copy:dist',
            'copy:abc',
            ...
        ]);