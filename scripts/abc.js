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
    templateUrl: 'views/abc.html',
    controller: 'abcController'
  };

}]);

app.controller('abcController', ['$scope', '$element', '$window', function ($scope, $element, $window) {

  // Chart class
  $scope.input.class = $scope.input.class || 'abc-chart';
  // Default title
  $scope.input.title = $scope.input.title || {};
  $scope.input.title.content = $scope.input.title.content || 'A Chart';
  $scope.input.title.size = $scope.input.title.size || 12;
  $scope.input.title.show = $scope.input.title.show === false ? false : true;
  $scope.input.title.align = $scope.input.title.align || 'center';
  $scope.input.title.margin = $scope.input.title.margin || 10;
  // Default hovering indices
  $scope.input.hovering = $scope.input.hovering || {};
  $scope.input.hovering.x = $scope.input.hovering.x || -1;
  $scope.input.hovering.y = $scope.input.hovering.y || -1;
  // Default chart type
  $scope.input.type = $scope.input.type || 'line';
  // Default chart element sizes
  $scope.input.lineWidth = $scope.input.lineWidth || 2;
  $scope.input.axisLineWidth = $scope.input.axisLineWidth || 1;
  $scope.input.pointWidth = $scope.input.pointWidth || 2.5;
  $scope.input.pointHoverWidth = $scope.input.pointHoverWidth || 4;
  $scope.input.axisTickWidth = $scope.input.axisTickSize || 1;
  $scope.input.axisTickSize = $scope.input.axisTickSize || 4;
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
  $scope.input.colors = $scope.input.colors || ['#d24949', '#e59648', '#4f8f47', '#316e93', '#684c8a'];
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
        y: $scope.settings.margin + $scope.settings.title.size + $scope.settings.title.margin,
        width: Math.max($scope.settings.width - $scope.settings.margin*2, 0),
        height: Math.max($scope.settings.height - $scope.settings.margin*2 - $scope.settings.title.size - $scope.settings.title.margin - $scope.settings.axisTickSize - $scope.settings.headers.size, 0)
      };
    },
    axisOffset: function () {
      return {
        x: $scope.settings.margin,
        y: $scope.settings.margin + $scope.settings.title.size + $scope.settings.title.margin,
        width: Math.max($scope.settings.width - $scope.settings.margin, 0),
        height: Math.max($scope.settings.height - $scope.settings.margin - $scope.settings.axisTickSize - $scope.settings.headers.size, 0)
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
    showZeroLine: function () {
      return ($scope.abc.calculatePointYValue(0) >= 0 && $scope.abc.calculatePointYValue(0) <= $scope.abc.chartOffset().height);
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
      if (lowest === highest) {
        lowest -= 1;
        highest += 1;
      }
      return {
        lowest: lowest,
        highest: highest
      };
    },
    highLowDif: function () {
      var highLow = $scope.abc.highLow();
      return this.difference(highLow.lowest, highLow.highest);
    },
    highLowBarDif: function () {
      var highLow = $scope.abc.highLow();
      return this.difference(Math.min(highLow.lowest, 0), Math.max(highLow.highest, 0));
    },
    difference: function (value1, value2) {
      return Math.abs(value1 - value2);
    },
    pointRadius: function (indexP, index)  {
      if ($scope.settings.hovering.y < 0) {
        return $scope.settings.hovering.x === index ? $scope.settings.pointHoverWidth : $scope.settings.pointWidth;
      }
      return $scope.settings.hovering.y === indexP && $scope.settings.hovering.x === index ? $scope.settings.pointHoverWidth : $scope.settings.pointWidth;
    },
    popupLegendX: function () {
      var maxOffset = $scope.abc.chartOffset().width - 26 - $scope.abc.getTextLength('#abc-popup-column-text') - $scope.abc.getTextLength('#abc-popup-value-text');
      var rightOffset = 0;
      if ($scope.settings.type === 'bar') {
        rightOffset = $scope.abc.hoveringBarOffset().x2 + 10;
        if (rightOffset > maxOffset) {
          return $scope.abc.calculateBarX($scope.settings.hovering.y, $scope.settings.hovering.x) - 26 - $scope.abc.getTextLength('#abc-popup-column-text') - $scope.abc.getTextLength('#abc-popup-value-text');
        }
        return rightOffset;
      }
      rightOffset = $scope.abc.calculatePoint($scope.settings.hovering.y, $scope.settings.hovering.x).x + 10;
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
    calculatePointXValue: function (index) {
      return $scope.abc.chartOffset().width / ($scope.settings.data[0].length-1) * index;
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
      x = $scope.abc.calculatePointXValue(index);
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
      points.unshift('0,' + Math.max(Math.min($scope.abc.calculatePointYValue(0), $scope.abc.chartOffset().height), 0));
      points.push($scope.abc.chartOffset().width + ',' + Math.max(Math.min($scope.abc.calculatePointYValue(0), $scope.abc.chartOffset().height), 0));
      return points.join(',');
    },
    getSplinePoints: function (indexP) {
      return $scope.settings.data[indexP].map(function (item, index) {
        var final = (index === 0 ? 'M' : '') + $scope.abc.calculatePoint(indexP, index).x + ' ' + $scope.abc.calculatePoint(indexP, index).y;
        if (index < $scope.settings.data[indexP].length-1) {
          final += ' C ' + $scope.abc.calculatePointXValue(index + 0.3) + ' ' + $scope.abc.calculatePoint(indexP, index).y +
            ' ' + $scope.abc.calculatePointXValue(index + 0.7) + ' ' + $scope.abc.calculatePoint(indexP, index+1).y;
        }
        return final;
      }).join(' ');
    },
    calculateBarWidth: function () {
      return $scope.abc.chartOffset().width / $scope.settings.data.length / $scope.settings.data[0].length;
    },
    calculateBarY: function (value) {
      var multiplier = $scope.abc.chartOffset().height / $scope.abc.highLowBarDif();
      return $scope.abc.chartOffset().height - value * multiplier + Math.min($scope.abc.highLow().lowest, 0) * multiplier;
    },
    calculateBarX: function (indexP, index) {
      return index * $scope.abc.chartOffset().width / $scope.settings.data[0].length + indexP * $scope.abc.chartOffset().width / $scope.settings.data[0].length / $scope.settings.data.length;
    },
    barOffset: function (indexP, index) {
      var multiplier = $scope.abc.chartOffset().height / $scope.abc.highLowBarDif();
      if ($scope.settings.data[indexP][index].value <= 0) {
        return {
          x: $scope.abc.calculateBarX(indexP, index),
          y: $scope.abc.calculateBarY(0),
          width: Math.max($scope.abc.calculateBarWidth(indexP, index), 0),
          height: Math.max($scope.settings.data[indexP][index].value * -multiplier, 0)
        };
      }
      return {
        x: $scope.abc.calculateBarX(indexP, index),
        y: $scope.abc.calculateBarY($scope.settings.data[indexP][index].value),
        width: Math.max($scope.abc.calculateBarWidth(indexP, index), 0),
        height: Math.max($scope.settings.data[indexP][index].value * multiplier, 0)
      };
    },
    hoverAreaOffset: function (index) {
      return {
        x: $scope.abc.chartOffset().width / ($scope.settings.data[0].length-1) * (index-0.5) + $scope.settings.margin,
        width: Math.max($scope.abc.chartOffset().width / ($scope.settings.data[0].length-1), 0)
      };
    },
    hoveringBarOffset: function () {
      if ($scope.settings.hovering.y < 0 || $scope.settings.hovering.x < 0) {
        return {x1: -10, y1: -10, x2: -10, y2: -10};
      }
      var barOffset = $scope.abc.barOffset($scope.settings.hovering.y, $scope.settings.hovering.x);
      if ($scope.settings.data[$scope.settings.hovering.y][$scope.settings.hovering.x].value >= 0) {
        return {
          x1: barOffset.x,
          y1: barOffset.y,
          x2: barOffset.x + $scope.abc.calculateBarWidth(),
          y2: barOffset.y
        };
      }
      return {
        x1: barOffset.x,
        y1: barOffset.y + barOffset.height,
        x2: barOffset.x + $scope.abc.calculateBarWidth(),
        y2: barOffset.y + barOffset.height
      };
    },
    hoveringClass: function (index) {
      if ($scope.settings.hovering.y >= 0) {
        return index !== $scope.settings.hovering.y ? 'not-hovering' : '';
      }
      return '';
    }
  };

}]);
