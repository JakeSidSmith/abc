'use strict';

var app = angular.module('abcApp');

app.service('ABC', [function () {

	var service = {};

	service.transformData = function (data) {
		var newData = [];

		for (var r = 1; r < data.length; r += 1) {
			newData.push([]);
			for (var c = 1; c < data[r].length; c += 1) {
				newData[r-1].push( {value: data[r][c] } );
			}
		}

		return newData;
	};

	service.transformHeaders = function (data) {
		var newHeaders = { rows: [], columns: [] };

		for (var r = 0; r < data.length; r += 1) {
			if (r === 0) {
				for (var c = 1; c < data[r].length; c += 1) {
					newHeaders.columns.push( {value: data[r][c]} );
				}
			} else {
				newHeaders.rows.push( {value: data[r][0]} );
			}
		}

		return newHeaders;
	};

	return service;

}]);

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
			// Default unit
			$scope.input.unit = $scope.input.unit || {};
			$scope.input.unit.type = $scope.input.unit.type || '%';
			$scope.input.unit.position = $scope.input.unit.position || 'after';
			// Default resize settings
			$scope.input.resize = $scope.input.resize || {};
			$scope.input.resize.width = $scope.input.resize.width === false ? false : true;
			$scope.input.resize.height = $scope.input.resize.height === false ? false : true;
			// Default margin
			$scope.input.margin = $scope.input.margin || 10;
			// Default sizes
			$scope.input.width = $scope.input.width || 0;
			$scope.input.height = $scope.input.height || 0;
			// Default Headers
			$scope.input.headers = $scope.input.headers || {};
			$scope.input.headers.size = $scope.input.headers.size || 10;
			$scope.input.headers.columns = $scope.input.headers.columns || [];
			$scope.input.headers.rows = $scope.input.headers.rows || [];
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
				axisLineSize: 4,
				mouseOffset: {
					x: 0,
					y: 0
				},
				setMouseOffset: function ($event) {
					$scope.abc.mouseOffset.x = $event.offsetX;
					$scope.abc.mouseOffset.y = $event.offsetY;
				},
				setHovering: function (indexP, index) {
					$scope.settings.hovering.y = indexP !== undefined ? indexP : -1;
					$scope.settings.hovering.x = index !== undefined ? index : -1;
				},
				chartOffset: function () {
					return {
						x: $scope.settings.margin,
						y: $scope.settings.margin + $scope.settings.title.size,
						width: $scope.settings.width - $scope.settings.margin*2,
						height: $scope.settings.height - $scope.settings.margin*2 - $scope.settings.title.size - $scope.abc.axisLineSize - $scope.settings.headers.size
					};
				},
				axisOffset: function () {
					return {
						x: $scope.settings.margin,
						y: $scope.settings.margin + $scope.settings.title.size,
						width: $scope.settings.width - $scope.settings.margin,
						height: $scope.settings.height - $scope.settings.margin - $scope.abc.axisLineSize - $scope.settings.headers.size
					};
				},
				titleOffset: function () {
					var getX = function () {
						if ($scope.settings.title.align === 'left') {
							return $scope.settings.margin;
						}
						if ($scope.settings.title.align === 'right') {
						  return $scope.settings.width - $scope.settings.margin - $scope.abc.getTextLength('#abc-title');
						}
						return $scope.settings.width / 2;
					};
					return {
						x: getX(),
						y: $scope.settings.title.size + $scope.settings.margin
					};
				},
				verticalLineOffset: function () {
					if ($scope.settings.hovering.y < 0 && $scope.settings.hovering.x >= 0) {
						return $scope.settings.hovering.x * ($scope.settings.width - $scope.settings.margin*2) / ($scope.settings.data[0].length-1);
					}
					return 0;
				},
				getTextLength: function (search) {
					var text = $element.find(search);
					return text[0].getComputedTextLength();
				},
				titleAnchor: function () {
					if ($scope.settings.title.align === 'left' || $scope.settings.title.align === 'right') {
						return $scope.settings.title.align;
					}
					return 'middle';
				},
				highLow: function () {
					var lowestSet = false;
					var highestSet = false;
					var lowest = 0;
					var highest = 0;
					angular.forEach($scope.settings.data, function (row) {
						angular.forEach(row, function (item) {
							if (item.value < lowest || lowestSet === false) {
								lowest = item.value;
								lowestSet = true;
							}
							if (item.value > highest || highestSet === false) {
								highest = item.value;
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
					var highLow = $scope.abc.highLow();
					return this.difference(highLow.lowest, highLow.highest);
				},
				difference: function (value1, value2) {
					return Math.abs(value1 - value2);
				},
				pointRadius: function (indexP, index)  {
					if ($scope.settings.hovering.y < 0) {
						return $scope.settings.hovering.x === index ? 5 : 2.5;
					}
					return $scope.settings.hovering.y === indexP && $scope.settings.hovering.x === index ? 5 : 2.5;
				},
				popupLegendX: function () {
					var rightOffset = $scope.abc.calculatePoint($scope.settings.hovering.y, $scope.settings.hovering.x).x + 10;
					var maxOffset = $scope.abc.chartOffset().width - 26 - $scope.abc.getTextLength('#abc-popup-column-text') - $scope.abc.getTextLength('#abc-popup-value-text');
					if (rightOffset > maxOffset) {
						return $scope.abc.calculatePoint($scope.settings.hovering.y, $scope.settings.hovering.x).x - 26 - $scope.abc.getTextLength('#abc-popup-column-text') - $scope.abc.getTextLength('#abc-popup-value-text');
					}
					return rightOffset;
				},
				valueInUnit: function (indexP, index) {
					if (indexP < 0 || index < 0) {
						return '';
					}
					if ($scope.settings.unit.position === 'before') {
						return $scope.settings.unit.type + $scope.settings.data[indexP][index].value;
					}
					return $scope.settings.data[indexP][index].value + $scope.settings.unit.type;
				},
				calculatePointYValue: function (value) {
					var multiplier = $scope.abc.chartOffset().height / $scope.abc.highLowDif();
					return $scope.abc.chartOffset().height + $scope.abc.highLow().lowest * multiplier - value * multiplier;
				},
				calculatePoint: function (indexP, index) {
					var x, y;
					if (indexP < 0) {
						return {x: -10, y: -10};
					} else if (index < 0) {
						y = -10;
					} else {
						y = $scope.abc.calculatePointYValue($scope.settings.data[indexP][index].value);
					}
					x = $scope.abc.chartOffset().width / ($scope.settings.data[indexP].length-1) * index;
					return {x: x, y: y};
				},
				getPoints: function (indexP) {
					var points = $scope.settings.data[indexP].map(function (item, index) {
						return $scope.abc.calculatePoint(indexP, index).x + ',' + $scope.abc.calculatePoint(indexP, index).y;
					}).join(',');

					return points;
				},
				getAreaPoints: function (indexP) {
					var points = $scope.settings.data[indexP].map(function (item, index) {
						return $scope.abc.calculatePoint(indexP, index).x + ',' + $scope.abc.calculatePoint(indexP, index).y;
					});
					points.unshift('0,' + ($scope.settings.height - $scope.settings.margin*2 - $scope.settings.title.size  - $scope.abc.axisLineSize - $scope.settings.headers.size));
					points.push(($scope.settings.width - $scope.settings.margin*2) + ',' + ($scope.settings.height - $scope.settings.margin*2 - $scope.settings.title.size - $scope.abc.axisLineSize - $scope.settings.headers.size));
					return points.join(',');
				},
				getSplinePoints: function (indexP) {
					return $scope.settings.data[indexP].map(function (item, index) {
						var first = 'M';

						if (index !== 0) {
							first = '';
						}
						var final = first + (($scope.settings.width-$scope.settings.margin*2) / ($scope.settings.data[indexP].length-1) * index) + ' ' + ($scope.settings.height - $scope.settings.margin*2 - $scope.settings.title.size - item.value - $scope.abc.axisLineSize - $scope.settings.headers.size);
						if (index < $scope.settings.data[indexP].length-1) {
							final += ' S ' + ((($scope.settings.width-$scope.settings.margin*2) / ($scope.settings.data[indexP].length-1) * index) + ($scope.settings.width-$scope.settings.margin*2) / ($scope.settings.data[indexP].length-1) * 0.5) +
									' ' + (($scope.settings.height - $scope.settings.margin*2 - item.value) + ($scope.settings.height - $scope.settings.margin*2 - $scope.settings.data[indexP][index + 1].value)) * 0.5;
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
