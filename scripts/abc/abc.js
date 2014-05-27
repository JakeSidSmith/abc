'use strict';

var app = angular.module('abcApp');

app.directive('abc', [function () {

	return {
		restrict: 'AE',
		replace: true,
		scope: {
			input: '=data'
		},
		templateUrl: '/views/abc.html',
		controller: function ($scope, $element) {
			// Default hovering indices
			$scope.input.hovering = $scope.input.hovering || {};
			$scope.input.hovering.x = $scope.input.hovering.x || -1;
			$scope.input.hovering.y = $scope.input.hovering.y || -1;
			// Default chart type
			$scope.input.type = $scope.input.type || 'line';
			// Default title
			$scope.input.title = $scope.input.title || {};
			$scope.input.title.content = $scope.input.title.content || 'A Chart';
			$scope.input.title.show = $scope.input.title.show === false ? false : true;
			// Default resize settings
			$scope.input.resize = $scope.input.resize || {};
			$scope.input.resize.width = $scope.input.resize.width === false ? false : true;
			$scope.input.resize.height = $scope.input.resize.height === false ? false : true;
			// Default margin
			$scope.input.margin = $scope.input.margin || 20;
			// Default sizes
			$scope.input.width = $scope.input.width || 0;
			$scope.input.height = $scope.input.height || 0;
			// Default data
			$scope.input.data = $scope.input.data || [];
			// Default colors
			$scope.input.colors = $scope.input.colors || ['red', 'green', 'blue', 'orange', 'purple'];
			// Set chartStyles for resizing
			$scope.chartStyle = {};
			$scope.chartStyle.width = $scope.input.resize.width === true ? '100%' : '';
			$scope.chartStyle.height = $scope.input.resize.height === true ? '100%' : '';

			$scope.input.width = $element.width();
			//$scope.input.height = $element.height();

			$scope.settings = $scope.input;

			$scope.abc = {
				chartOffset: function () {
					return 'translate(' + $scope.settings.margin + ',' + $scope.settings.margin + ')';
				},
				getPoints: function (index) {
					var points = $scope.settings.data[index].map(function (item, itemIndex) {
						return (($scope.settings.width-$scope.settings.margin*2) / ($scope.settings.data[index].length-1) * itemIndex) + ',' + ($scope.settings.height - $scope.settings.margin*2 - item.value);
					}).join(',');

					return points;
				},
				getAreaPoints: function (index) {
					var points = $scope.settings.data[index].map(function (item, itemIndex) {
						return (($scope.settings.width-$scope.settings.margin*2) / ($scope.settings.data[index].length-1) * itemIndex) + ',' + ($scope.settings.height - $scope.settings.margin*2 - item.value);
					});
					points.unshift('0,' + ($scope.settings.height - $scope.settings.margin*2));
					points.push(($scope.settings.width - $scope.settings.margin*2) + ',' + ($scope.settings.height - $scope.settings.margin*2));
					return points.join(',');
				},
				getSplinePoints: function (index) {
					return $scope.settings.data[index].map(function (item, itemIndex) {
						var first = 'M';

						if (itemIndex !== 0) {
							first = '';
						}
						var final = first + (($scope.settings.width-$scope.settings.margin*2) / ($scope.settings.data[index].length-1) * itemIndex) + ' ' + ($scope.settings.height - $scope.settings.margin*2 - item.value);
						if (itemIndex < $scope.settings.data[index].length-1) {
							final += ' S ' + ((($scope.settings.width-$scope.settings.margin*2) / ($scope.settings.data[index].length-1) * itemIndex) + ($scope.settings.width-$scope.settings.margin*2) / ($scope.settings.data[index].length-1) * 0.5) + ' ' + ($scope.settings.height - $scope.settings.margin*2 - item.value);
						}
						return final;
					}).join(' ');
				},
				hoveringClass: function (index) {
					if ($scope.settings.hovering.y >= 0) {
						return index !== $scope.settings.hovering.y ? 'not-hovering' : '';
					}
					return '';
				},
				hoveringCircle: function () {
					if ($scope.settings.hovering.y < 0) {
						return {x: -100, y: -100};
					}
					return {
						x: $scope.settings.hovering.x * ($scope.settings.width - $scope.settings.margin*2) / ($scope.settings.data[$scope.settings.hovering.y].length-1) + $scope.settings.margin,
						y: $scope.settings.height - $scope.settings.margin - $scope.settings.data[$scope.settings.hovering.y][$scope.settings.hovering.x].value
					};
				},
				hoveringBar: function () {
					if ($scope.settings.hovering.y >= 0) {
						var values = {};
						values.x1 = $scope.settings.margin + ($scope.settings.hovering.x) * ($scope.settings.width-$scope.settings.margin*2) / ($scope.settings.data[$scope.settings.hovering.y].length) + $scope.settings.hovering.y * ($scope.settings.width-$scope.settings.margin*2) / ($scope.settings.data[$scope.settings.hovering.y].length) / $scope.settings.data.length;
						values.x2 = values.x1 + ($scope.settings.width - $scope.settings.margin*2) / $scope.settings.data[$scope.settings.hovering.y].length / $scope.settings.data.length;
						return values;
					}
					return {
						x1: -100,
						x2: -100
					};
				}
			};

		}
	};

}]);
