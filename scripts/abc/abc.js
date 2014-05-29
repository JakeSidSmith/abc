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
		controller: function ($scope, $element, $window) {
			// Default title
			$scope.input.title = $scope.input.title || {};
			$scope.input.title.content = $scope.input.title.content || 'A Chart';
			$scope.input.title.size = $scope.input.title.size || 12;
			$scope.input.title.show = $scope.input.title.show === false ? false : true;
			$scope.input.title.align = $scope.input.title.align || 'center';
			// Default hovering indices
			$scope.input.hovering = $scope.input.hovering || {};
			$scope.input.hovering.x = $scope.input.hovering.x || -1;
			$scope.input.hovering.y = $scope.input.hovering.y || -1;
			// Default chart type
			$scope.input.type = $scope.input.type || 'line';
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

			$scope.getElementDimensions = function () {
		    return { 'h': $element.height(), 'w': $element.width() };
		  };

		  $scope.$watch('getElementDimensions()', function (newValue, oldValue) {
				if (oldValue !== newValue) {
			    $scope.input.width = $element.width();
					$scope.input.height = $element.height();
				}
		  }, true);

			if ($scope.input.resize.width || $scope.input.resize.height){
				angular.element($window).bind('resize', function () {
					$scope.$apply();
				});
			}

			$scope.settings = $scope.input;

			$scope.abc = {
				setHovering: function (indexP, index) {
					$scope.settings.hovering.y = indexP !== undefined ? indexP : -1;
					$scope.settings.hovering.x = index !== undefined ? index : -1;
				},
				axisOffset: function () {
					return {
						x: $scope.settings.margin,
						y: $scope.settings.margin + $scope.settings.title.size,
						width: $scope.settings.width - $scope.settings.margin,
						height: $scope.settings.height - $scope.settings.margin
					};
				},
				titleOffset: function () {
					var getX = function () {
						if ($scope.settings.title.align === 'center') {
							return $scope.settings.width / 2;
						}
						if ($scope.settings.title.align === 'left') {
							return $scope.settings.margin;
						}
						if ($scope.settings.title.align === 'right') {
						  return $scope.settings.width - $scope.settings.margin;
						}
					};
					return {
						x: getX(),
						y: $scope.settings.title.size
					};
				},
				titleAnchor: function () {
					if ($scope.settings.title.align === 'center') {
						return 'middle';
					}
					return $scope.settings.title.align;
				},
				highLow: function () {
					var lowestSet = false;
					var highestSet = false;
					var lowest = 0;
					var highest = 0;
					angular.forEach($scope.settings.data, function (row) {
						angular.forEach(row, function (item) {
							if (item < lowest || lowestSet === false) {
								lowest = item;
								lowestSet = true;
							}
							if (item > highest || highestSet === false) {
								highest = item;
								highestSet = true;
							}
						});
					});
					return {
						lowest: lowest,
						highest: highest
					};
				},
				highLowDif: function () {
					var highLow = this.highLow();
					return this.difference(highLow.lowest, highLow.highest);
				},
				difference: function (value1, value2) {
					return Math.abs(value1 - value2);
				},
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
							final += ' S ' + ((($scope.settings.width-$scope.settings.margin*2) / ($scope.settings.data[index].length-1) * itemIndex) + ($scope.settings.width-$scope.settings.margin*2) / ($scope.settings.data[index].length-1) * 0.5) +
									' ' + (($scope.settings.height - $scope.settings.margin*2 - item.value) + ($scope.settings.height - $scope.settings.margin*2 - $scope.settings.data[index][itemIndex + 1].value)) * 0.5;
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
					if ($scope.settings.hovering.y >= 0 && $scope.settings.hovering.x >= 0) {
						return {
							x: $scope.settings.hovering.x * ($scope.settings.width - $scope.settings.margin*2) / ($scope.settings.data[$scope.settings.hovering.y].length-1) + $scope.settings.margin,
							y: $scope.settings.height - $scope.settings.margin - $scope.settings.data[$scope.settings.hovering.y][$scope.settings.hovering.x].value
						};
					}
					return {x: -100, y: -100};
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
				},
				chartWidth: function () {
					return $element[0].offsetWidth;
				}
			};

		}
	};

}]);
