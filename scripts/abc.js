'use strict';

angular.module('angularAbc', [])

.service('ABC', [function () {

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

}])

.directive('abc', [function () {

  return {
    restrict: 'AE',
    replace: true,
    scope: {
      input: '=data'
    },
    templateUrl: 'bower_components/angular-abc/views/abc.html',
    controller: 'abcController'
  };

}])

.controller('abcController', ['$scope', '$element', '$window', function ($scope, $element, $window) {

  // Chart class
  $scope.input.class = $scope.input.class || 'abc-chart';
  $scope.input.focusClass = $scope.input.focusClass || 'abc-focus';
  $scope.input.nofocusClass = $scope.input.nofocusClass || 'abc-nofocus';
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
  $scope.input.axisTickWidth = $scope.input.axisTickSize || 1;
  $scope.input.axisTickSize = $scope.input.axisTickSize || 4;
  $scope.input.pointSize = $scope.input.pointSize || 2.5;
  $scope.input.pointHoverSize = $scope.input.pointHoverSize || 4;
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
  // Region defaults
  $scope.input.regions = $scope.input.regions || [];
  // Deault transforms
  $scope.input.transform = $scope.input.transform || {};
  var returnValue = function (value) {
    return value;
  };
  $scope.input.transform.yLabels = $scope.input.transform.yLabels || returnValue;
  $scope.input.transform.xLabels = $scope.input.transform.xLabels || returnValue;
  $scope.input.transform.popupLabels = $scope.input.transform.popupLabels || returnValue;
  $scope.input.transform.popupValues = $scope.input.transform.popupValues || returnValue;

  $scope.settings = $scope.input;

  var updateChartOffset = {
    x: function () {
      $scope.abc.chartOffset.x = $scope.settings.margin + $scope.settings.axisTickSize*1.5 + $scope.abc.yLongestTickText();
    },
    y: function () {
      $scope.abc.chartOffset.y = $scope.settings.margin + $scope.settings.title.size + $scope.settings.title.margin;
    },
    width: function () {
      $scope.abc.chartOffset.width = Math.max($scope.settings.width - $scope.settings.margin*2 - $scope.settings.axisTickSize*1.5 - $scope.abc.yLongestTickText(), 0);
    },
    height: function () {
      $scope.abc.chartOffset.height = Math.max($scope.settings.height - $scope.settings.margin*2 - $scope.settings.title.size - $scope.settings.title.margin - $scope.settings.axisTickSize - $scope.settings.headers.size, 0);
    }
  };

  var updateYTicks = function () {
    // Update total
    if ($scope.settings.headers.size <= 0) {
      $scope.abc.yTickTotal = 1;
    } else {
      $scope.abc.yTickTotal = Math.max(Math.ceil(Math.max($scope.abc.chartOffset.height, 0) / ($scope.settings.headers.size * 2)), 1);
    }

    // Rough offset
    var roughOffset = Math.max($scope.abc.highLowDif() / $scope.abc.yTickTotal, 0);

    // Update list
    var list = [];
    for (var i = 0; i < $scope.abc.yTickTotal; i += 1) {
      list.push(i);
    }
    $scope.abc.yTickList = list;

    // Update interval
    var power = $scope.abc.powerToDecimal(roughOffset);


    if (roughOffset > 1) {
      roughOffset /= power;
      roughOffset = $scope.abc.customRounding(roughOffset);
      roughOffset *= power;
      $scope.abc.yTickInterval = Math.max(roughOffset, 0);
    } else {
      roughOffset *= power;
      roughOffset = $scope.abc.customRounding(roughOffset);
      roughOffset /= power;
      $scope.abc.yTickInterval = Math.max(roughOffset, 0);
    }
  };

  var chartWidthUpdate = function (newValue, oldValue) {
    if (oldValue === undefined || newValue !== oldValue) {
      updateChartOffset.x();
      updateChartOffset.width();
    }
  };

  var chartHeightUpdate = function (newValue, oldValue) {
    if (oldValue === undefined || newValue !== oldValue) {
      updateChartOffset.y();
      updateChartOffset.height();
      updateYTicks();
    }
  };

  var changeTicksUpdate = function (newValue, oldValue) {
    if (oldValue === undefined || newValue !== oldValue) {
      updateYTicks();
    }
  };

  $scope.$watch('settings.width', chartWidthUpdate);
  $scope.$watch('settings.margin', chartWidthUpdate);
  $scope.$watch('settings.axisTickSize', chartWidthUpdate);
  $scope.$watch('settings.axisTickSize', chartWidthUpdate);
  $scope.$watch('abc.yTickInterval', chartWidthUpdate);
  $scope.$watch('abc.yLongestTickText()', chartWidthUpdate);

  $scope.$watch('settings.height', chartHeightUpdate);
  $scope.$watch('settings.axisTickSize', chartHeightUpdate);
  $scope.$watch('settings.margin', chartHeightUpdate);
  $scope.$watch('settings.title.size', chartHeightUpdate);
  $scope.$watch('settings.title.margin', chartHeightUpdate);
  $scope.$watch('settings.headers.size', chartHeightUpdate);

  $scope.$watch('abc.highLow()', changeTicksUpdate, true);
  $scope.$watch('settings.headers.size', changeTicksUpdate);

  $scope.getElementDimensions = function () {
    return { 'width': $element.width(), 'height': $element.height() };
  };

  $scope.$watch('getElementDimensions()', function (newValue, oldValue) {
    if (oldValue !== newValue) {
      $scope.settings.width = $element.width();
      $scope.settings.height = $element.height();
    }
  }, true);

  if ($scope.settings.resize.width || $scope.settings.resize.height){
    angular.element($window).bind('resize', function () {
      $scope.$apply();
    });
  }

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
    chartOffset: {
      x: 0,
      y: 0,
      width: 0,
      height: 0
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
        return $scope.settings.hovering.x * $scope.abc.chartOffset.width / ($scope.settings.data[0].length-1);
      }
      return 0;
    },
    showZeroLine: function () {
      return ($scope.abc.calculatePointYValue(0) >= 0 && $scope.abc.calculatePointYValue(0) <= $scope.abc.chartOffset.height);
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
      return $scope.abc.difference(highLow.lowest, highLow.highest);
    },
    highLowBarDif: function () {
      var highLow = $scope.abc.highLow();
      return $scope.abc.difference(Math.min(highLow.lowest, 0), Math.max(highLow.highest, 0));
    },
    difference: function (value1, value2) {
      return Math.abs(value1 - value2);
    },
    pointRadius: function (indexP, index)  {
      if ($scope.settings.hovering.y < 0) {
        if ($scope.settings.hovering.x === index) {
          return Math.abs($scope.settings.pointHoverSize);
        }
        return Math.abs($scope.settings.pointSize);
      }
      if ($scope.settings.hovering.y === indexP && $scope.settings.hovering.x === index) {
        return Math.abs($scope.settings.pointHoverSize);
      }
      return Math.abs($scope.settings.pointSize);
    },
    popupLegendX: function () {
      var maxOffset = $scope.abc.chartOffset.width - 26 - $scope.abc.getTextLength('#abc-popup-column-text') - $scope.abc.getTextLength('#abc-popup-value-text');
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
    popupLabel: function (indexP) {
      var value;
      if (indexP < 0) {
        return '';
      } else {
        value = $scope.settings.headers.rows[$scope.settings.hovering.y].value;
      }
      return $scope.settings.transform.popupLabels(value);
    },
    popupValue: function (indexP, index) {
      var value;
      if (indexP < 0 || index < 0) {
        return '';
      } else {
        value = $scope.settings.data[indexP][index].value;
      }
      return $scope.settings.transform.popupValues(value);
    },
    calculatePointYValue: function (value) {
      var multiplier = $scope.abc.chartOffset.height / $scope.abc.highLowDif();
      return $scope.abc.chartOffset.height + $scope.abc.highLow().lowest * multiplier - value * multiplier;
    },
    calculatePointXValue: function (index) {
      return $scope.abc.chartOffset.width / ($scope.settings.data[0].length-1) * index;
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
      points.unshift('0,' + Math.max(Math.min($scope.abc.calculatePointYValue(0), $scope.abc.chartOffset.height), 0));
      points.push($scope.abc.chartOffset.width + ',' + Math.max(Math.min($scope.abc.calculatePointYValue(0), $scope.abc.chartOffset.height), 0));
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
      return $scope.abc.chartOffset.width / $scope.settings.data.length / $scope.settings.data[0].length;
    },
    calculateBarY: function (value) {
      var multiplier = $scope.abc.chartOffset.height / $scope.abc.highLowBarDif();
      return $scope.abc.chartOffset.height - value * multiplier + Math.min($scope.abc.highLow().lowest, 0) * multiplier;
    },
    calculateBarX: function (indexP, index) {
      return index * $scope.abc.chartOffset.width / $scope.settings.data[0].length + indexP * $scope.abc.chartOffset.width / $scope.settings.data[0].length / $scope.settings.data.length;
    },
    barOffset: function (indexP, index) {
      var multiplier = $scope.abc.chartOffset.height / $scope.abc.highLowBarDif();
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
        x: $scope.abc.chartOffset.width / ($scope.settings.data[0].length-1) * (index-0.5) + $scope.settings.margin,
        width: Math.max($scope.abc.chartOffset.width / ($scope.settings.data[0].length-1), 0)
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
        return index !== $scope.settings.hovering.y ? $scope.input.nofocusClass : $scope.input.focusClass;
      }
      return '';
    },
    powerToDecimal: function (value) {
      value = Math.abs(value);
      if (value === 0) {
        value = 0.1;
      }
      var powerIndex = 0;

      if (value > 1) {
        while (value > 1) {
          value /= 10;
          powerIndex += 1;
        }
        return Math.pow(10, powerIndex);
      }
      while (value < 1) {
        value *= 10;
        powerIndex += 1;
      }
      return Math.pow(10, powerIndex - 1);
    },
    customRounding: function (value) {
      //value = Math.round(value);
      var roundings = [0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.75, 1];

      for (var i = 0; i < roundings.length; i += 1) {
        if (value <= roundings[i]) {
          return roundings[i];
        }
      }
      return 1;
    },
    yTickTotal: 0,
    yTickList: [],
    yTickInterval: 0,
    yLowestTickIndex: function () {
      return Math.ceil($scope.abc.highLow().lowest / $scope.abc.yTickInterval);
    },
    yTickValue: function (index) {
      return (index + $scope.abc.yLowestTickIndex()) * $scope.abc.yTickInterval;
    },
    readableYTickValue: function (index) {
      var returnValue;
      var value = $scope.abc.yTickValue(index);

      if (value < 0.1 && value > -0.1) {
        if (value === 0) {
          returnValue = 0;
        } else {
          var power = $scope.abc.powerToDecimal(value);
          returnValue = value.toFixed(power.toString().length);
        }
      } else {
        returnValue = value.toFixed(2);
      }

      return $scope.settings.transform.yLabels(returnValue);
    },
    yTickOffset: function (index) {
      return $scope.abc.calculatePointYValue( $scope.abc.yTickValue(index) );
    },
    yTickTextLength: function (index) {
      var text = $element.find('.abc-y-labels');
      return text[index].getComputedTextLength();
    },
    yLongestTickText: function () {
      var texts = $element.find('.abc-y-labels');
      var longestFound = false;
      var longest = 0;

      for (var i = 0; i < texts.length; i += 1) {
        var textLength = texts[i].getComputedTextLength();
        if (!longestFound || textLength > longest) {
          longest = textLength;
          longestFound = true;
        }
      }
      return longest;
    },
    regionOffset: function (region) {
      var start, end;
      if (region.start > region.end) {
        start = region.end;
        end = region.start;
      } else {
        start = region.start;
        end = region.end;
      }
      return {
        x: $scope.abc.calculatePointXValue(start),
        width: $scope.abc.calculatePointXValue(end - start)
      };
    },
    regionTitleOffset: function (region) {
      var start, end, dif;
      if (region.start > region.end) {
        start = region.end;
        end = region.start;
      } else {
        start = region.start;
        end = region.end;
      }
      dif = end - start;
      return {
        x: $scope.abc.calculatePointXValue(start + dif/2),
        y: $scope.abc.chartOffset.height / 2
      };
    }
  };

  // Set initial chart values
  updateChartOffset.x();
  updateChartOffset.y();
  updateChartOffset.width();
  updateChartOffset.height();
  updateYTicks();

}]);
