/* global angular */

/* eslint-disable max-len */

'use strict';

angular.module('angularAbc', [])

.service('ABC', [function () {

  var service = {};

  service.transformData = function (data) {
    var newData = [];

    for (var r = 1; r < data.length; r += 1) {
      newData.push([]);
      for (var c = 1; c < data[r].length; c += 1) {
        newData[r - 1].push({value: data[r][c]});
      }
    }

    return newData;
  };

  service.transformHeaders = function (data) {
    var newHeaders = {rows: [], columns: []};

    for (var r = 0; r < data.length; r += 1) {
      if (r === 0) {
        for (var c = 1; c < data[r].length; c += 1) {
          newHeaders.columns.push({value: data[r][c]});
        }
      } else {
        newHeaders.rows.push({value: data[r][0]});
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
    template:
      '<svg ng-class="settings.class" ng-style="chartStyle" ng-attr-width="{{settings.width}}" ng-attr-height="{{settings.height}}" ng-mousemove="abc.setMouseOffset($event)" >' +
        '<!-- Title -->' +
        '<text id="abc-title" ng-show="settings.title.show === true" ng-attr-x="{{abc.titleOffset().x}}" ng-attr-y="{{abc.titleOffset().y}}" fill="black" ng-attr-text-anchor="{{abc.titleAnchor()}}" ng-attr-font-size="{{settings.title.size}}" ng-bind="settings.title.content"></text>' +
        '<!-- Regions -->' +
        '<g id="abc-regions" ng-attr-transform="translate({{abc.chartOffset.x}}, {{abc.chartOffset.y}})">' +
          '<g ng-repeat="region in settings.regions">' +
            '<clipPath id="abc-region-clip-path-{{$index}}">' +
              '<rect y="0" ng-attr-x="{{abc.regionOffset(region).x}}" ng-attr-width="{{abc.regionOffset(region).width}}" ng-attr-height="{{abc.chartOffset.height}}"></rect>' +
            '</clipPath>' +
            '<rect id="abc-region-rectangle" y="0" ng-attr-x="{{abc.regionOffset(region).x}}" ng-attr-width="{{abc.regionOffset(region).width}}" ng-attr-height="{{abc.chartOffset.height}}" ng-attr-fill="{{region.color}}" ng-attr-fill-opacity="{{abc.regionFillOpacity(region)}}"></rect>' +
            '<text clip-path="url(#abc-region-clip-path-{{$index}})" text-anchor="middle" ng-attr-x="{{abc.regionTitleOffset(region).x}}" ng-attr-y="{{abc.regionTitleOffset(region).y}}" ng-bind="region.title" ng-attr-font-size="{{region.size}}" ng-attr-fill="{{region.color}}" fill-opacity="0.5"></text>' +
          '</g>' +
        '</g>' +
        '<!-- Bands -->' +
        '<g id="abc-bands" ng-attr-transform="translate({{abc.chartOffset.x}}, {{abc.chartOffset.y}})">' +
          '<g ng-repeat="band in settings.bands">' +
            '<clipPath id="abc-band-clip-path-{{$index}}">' +
              '<rect x="0" ng-attr-width="{{abc.chartOffset.width}}" ng-attr-y="{{abc.bandOffset(band).y}}" ng-attr-height="{{abc.bandOffset(band).height}}"></rect>' +
            '</clipPath>' +
            '<rect id="abc-band-rectangle" x="0" ng-attr-width="{{abc.chartOffset.width}}" ng-attr-y="{{abc.bandOffset(band).y}}" ng-attr-height="{{abc.bandOffset(band).height}}" ng-attr-fill="{{band.color}}" fill-opacity="0.2"></rect>' +
            '<text clip-path="url(#abc-band-clip-path-{{$index}})" text-anchor="middle" ng-attr-x="{{abc.chartOffset.width / 2}}" ng-attr-y="{{abc.bandTitleOffset(band).y}}" ng-bind="band.title" ng-attr-font-size="{{band.size}}" ng-attr-fill="{{band.color}}" fill-opacity="0.5"></text>' +
          '</g>' +
        '</g>' +
        '<!-- Main Chart Elements -->' +
        '<abc-line ng-show="settings.type === \'line\'"></abc-line>' +
        '<abc-area ng-show="settings.type === \'area\'"></abc-area>' +
        '<abc-spline ng-show="settings.type === \'spline\'"></abc-spline>' +
        '<abc-bar ng-show="settings.type === \'bar\'"></abc-bar>' +
        '<!-- Axis -->' +
        '<g id="abc-axis" ng-attr-transform="translate({{abc.chartOffset.x}}, {{abc.chartOffset.y}})">' +
          '<!-- Y Axis -->' +
          '<line ng-attr-stroke-width="{{settings.axisLineWidth}}" stroke="black" x1="0" y1="0" x2="0" ng-attr-y2="{{abc.chartOffset.height}}"></line>' +
          '<!-- Y Axis Ticks -->' +
          '<line ng-hide="abc.yTickOffset($index) < 0 || abc.yTickOffset($index) > abc.chartOffset.height" ng-repeat="tick in abc.yTickList" ng-attr-x1="{{0 - settings.axisTickSize}}" ng-attr-y1="{{abc.yTickOffset($index)}}" x2="0" ng-attr-y2="{{abc.yTickOffset($index)}}" stroke="black" ng-attr-stroke-width="{{settings.axisTickWidth}}"></line>' +
          '<!-- Y Axis Labels -->' +
          '<g id="abc-y-labels">' +
            '<text ng-hide="abc.yTickOffset($index) < 0 || abc.yTickOffset($index) > abc.chartOffset.height" ng-repeat="tick in abc.yTickList" ng-attr-x="{{abc.yAxisLabelY($index)}}" ng-attr-y="{{abc.yTickOffset($index) + settings.headers.size / 2.5}}" text-anchor="right" ng-bind="abc.readableYTickValue($index)" ng-attr-font-size="{{settings.headers.size}}"></text>' +
          '</g>' +
          '<!-- X Axis -->' +
          '<line ng-attr-stroke-width="{{settings.axisLineWidth}}" stroke="black" x1="0" ng-attr-y1="{{abc.chartOffset.height}}" ng-attr-x2="{{abc.chartOffset.width}}" ng-attr-y2="{{abc.chartOffset.height}}"></line>' +
          '<!-- X Axis Ticks -->' +
          '<line ng-repeat="tick in settings.data[0]" ng-attr-x1="{{abc.calculatePointXValue($index)}}" ng-attr-y1="{{abc.chartOffset.height}}" ng-attr-x2="{{abc.calculatePointXValue($index)}}" ng-attr-y2="{{abc.chartOffset.height + settings.axisTickSize}}" stroke="black" ng-attr-stroke-width="{{settings.axisTickWidth}}"></line>' +
          '<!-- X Axis Labels -->' +
          '<g id="abc-x-labels">' +
            '<text ng-repeat="column in settings.headers.columns" ng-attr-x="{{abc.calculatePointXValue($index + settings.xAxisLabelOffset)}}" ng-attr-y="{{abc.chartOffset.height + settings.axisTickSize + settings.headers.size}}" text-anchor="middle" ng-bind="settings.transform.xLabels(column.value)" ng-attr-font-size="{{settings.headers.size}}" ng-attr-fill-opacity="{{abc.xAxisLabelOpacity($index)}}"></text>' +
          '</g>' +
        '</g>' +
        '<!-- Hovering lines & areas -->' +
        '<g id="abc-hovering-areas" ng-attr-transform="translate({{abc.chartOffset.x}}, {{abc.chartOffset.y}})">' +
          '<!-- Bar Top -->' +
          '<line ng-show="settings.type === \'bar\' && settings.hovering.y >= 0" ng-attr-x1="{{abc.hoveringBarOffset().x1}}" ng-attr-y1="{{abc.hoveringBarOffset().y1}}" ng-attr-x2="{{abc.hoveringBarOffset().x2}}" ng-attr-y2="{{abc.hoveringBarOffset().y2}}" stroke-width="2" stroke="black"></line>' +
          '<!-- Zero Line -->' +
          '<line ng-show="abc.showZeroLine()" x1="0" ng-attr-y1="{{abc.calculatePointYValue(0)}}" ng-attr-x2="{{abc.chartOffset.width}}" ng-attr-y2="{{abc.calculatePointYValue(0)}}" stroke-width="2" stroke-opacity="0.5" stroke="black"></line>' +
          '<!-- Horizontal Line -->' +
          '<line ng-show="settings.hovering.y >= 0 && settings.hovering.x >= 0" x1="0" ng-attr-y1="{{abc.calculatePoint(settings.hovering.y, settings.hovering.x).y}}" ng-attr-x2="{{abc.chartOffset.width}}" ng-attr-y2="{{abc.calculatePoint(settings.hovering.y, settings.hovering.x).y}}" stroke-width="1" stroke-opacity="0.5" stroke="black"></line>' +
          '<!-- Vertical Line -->' +
          '<line ng-show="settings.type !== \'bar\' && settings.hovering.y < 0 && settings.hovering.x >= 0" ng-attr-x1="{{abc.verticalLineOffset()}}" y1="0" ng-attr-x2="{{abc.verticalLineOffset()}}" ng-attr-y2="{{abc.chartOffset.height}}" stroke-width="1" stroke-opacity="0.5" stroke="black"></line>' +
          '<!-- Hovering Areas -->' +
          '<rect ng-show="settings.type !== \'bar\'" ng-repeat="line in settings.data[0]" ng-attr-x="{{abc.hoverAreaOffset($index).x}}" y="0" ng-attr-width="{{abc.hoverAreaOffset().width}}" ng-attr-height="{{abc.chartOffset.height}}" ng-mouseover="abc.setHovering(undefined, $index)" ng-mouseout="abc.setHovering()" fill="rgba(0, 0, 0, 0)"></rect>' +
          '<!-- Hovering Areas for Bar -->' +
          '<g id="abc-hovering-areas-bars" ng-show="settings.type === \'bar\'" ng-class="abc.hoveringClass($index)" ng-repeat="points in settings.data">' +
            '<rect ng-mouseover="abc.setHovering($parent.$index, $index)" ng-mouseout="abc.setHovering()" ng-repeat="point in points" ng-attr-x="{{abc.barOffset($parent.$index, $index).x}}" y="0" ng-attr-width="{{abc.barOffset($parent.$index, $index).width}}" ng-attr-height="{{abc.chartOffset.height}}" fill="rgba(0, 0, 0, 0)"></rect>' +
          '</g>' +
        '</g>' +
        '<!-- Points -->' +
        '<g id="abc-points" ng-show="settings.type !== \'bar\'" ng-class="abc.hoveringClass($index)" ng-attr-transform="translate({{abc.chartOffset.x}}, {{abc.chartOffset.y}})" ng-repeat="points in settings.data" ng-attr-fill="{{settings.colors[$index % settings.colors.length]}}">' +
          '<circle ng-mouseover="abc.setHovering($parent.$index, $index)" ng-mouseout="abc.setHovering()" ng-repeat="point in points" ng-attr-cx="{{abc.calculatePoint($parent.$index, $index).x}}" ng-attr-cy="{{abc.calculatePoint($parent.$index, $index).y}}" ng-attr-r="{{abc.pointRadius($parent.$index, $index)}}"></circle>' +
        '</g>' +
        '<!-- Popup group -->' +
        '<g id="abc-popup" ng-attr-transform="translate({{abc.chartOffset.x}}, {{abc.chartOffset.y}})">' +
          '<!-- Popup Legend -->' +
          '<g id="abc-popup-legend" ng-show="settings.hovering.y >= 0 && settings.hovering.x >= 0" ng-attr-transform="translate({{abc.popupLegendX()}}, {{abc.calculatePoint(settings.hovering.y, settings.hovering.x).y - 30}})" >' +
            '<rect id="popup-header-background" x="0" y="0" ng-attr-width="{{abc.popupWidth()}}" height="20" fill-opacity="0.9" stroke-opacity="0.9" fill="grey" stroke="grey" stroke-width="1"></rect>' +
            '<rect id="popup-value-background" x="0" y="20" ng-attr-width="{{abc.popupWidth()}}" height="20" fill-opacity="0.9" stroke-opacity="0.6" fill="white" stroke="grey" stroke-width="1"></rect>' +
            '<g id="popup-headers">' +
              '<text id="abc-popup-column-text" x="4" y="14" fill="white" font-size="12" text-anchor="left" ng-bind="abc.popupColumnLabel(settings.hovering.x)"></text>' +
              '<text id="abc-popup-row-text" x="4" y="34" fill="black" font-size="12" text-anchor="left" ng-bind="abc.popupRowLabel(settings.hovering.y)"></text>' +
            '</g>' +
            '<g id="popup-values">' +
              '<text id="abc-popup-value-text" ng-attr-x="{{abc.popupValueX()}}" y="34" fill="black" font-size="12" text-anchor="left" ng-bind="abc.popupValue(settings.hovering.y, settings.hovering.x)"></text>' +
            '</g>' +
          '</g>' +
        '</g>' +
      '</svg>',
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
  $scope.input.title.content = $scope.input.title.content;
  $scope.input.title.show = $scope.input.title.show === false ? false : true;
  $scope.input.title.align = $scope.input.title.align || 'center';
  if ($scope.input.title.content) {
    $scope.input.title.size = $scope.input.title.size !== undefined ? $scope.input.title.size : 12;
    $scope.input.title.margin = $scope.input.title.margin !== undefined ? $scope.input.title.margin : 10;
  } else {
    $scope.input.title.size = 0;
    $scope.input.title.margin = 0;
  }
  // Default hovering indices
  $scope.input.hovering = $scope.input.hovering || {};
  $scope.input.hovering.x = $scope.input.hovering.x !== undefined ? $scope.input.hovering.x : -1;
  $scope.input.hovering.y = $scope.input.hovering.y !== undefined ? $scope.input.hovering.y : -1;
  // Default chart type
  $scope.input.type = $scope.input.type || 'line';
  // Default chart element sizes
  $scope.input.lineWidth = $scope.input.lineWidth !== undefined ? $scope.input.lineWidth : 2;
  $scope.input.axisLineWidth = $scope.input.axisLineWidth !== undefined ? $scope.input.axisLineWidth : 1;
  $scope.input.axisTickWidth = $scope.input.axisTickSize !== undefined ? $scope.input.axisTickSize : 1;
  $scope.input.axisTickSize = $scope.input.axisTickSize !== undefined ? $scope.input.axisTickSize : 4;
  $scope.input.pointSize = $scope.input.pointSize !== undefined ? $scope.input.pointSize : 2.5;
  $scope.input.pointHoverSize = $scope.input.pointHoverSize !== undefined ? $scope.input.pointHoverSize : 4;
  // Default resize settings
  $scope.input.resize = $scope.input.resize || {};
  $scope.input.resize.width = $scope.input.resize.width === false ? false : true;
  $scope.input.resize.height = $scope.input.resize.height || false;
  // Default margin
  $scope.input.margin = $scope.input.margin !== undefined ? $scope.input.margin : 10;
  // Default sizes
  $scope.input.width = $scope.input.width || 0;
  $scope.input.height = $scope.input.height || 0;
  // Default Headers
  $scope.input.headers = $scope.input.headers || {};
  $scope.input.headers.size = $scope.input.headers.size !== undefined ? $scope.input.headers.size : 10;
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
  // Region bands
  $scope.input.bands = $scope.input.bands || [];
  // Deault transforms
  $scope.input.transform = $scope.input.transform || {};
  var returnValue = function (value) {
    return value;
  };
  $scope.input.transform.yLabels = $scope.input.transform.yLabels || returnValue;
  $scope.input.transform.xLabels = $scope.input.transform.xLabels || returnValue;
  $scope.input.transform.popupLabels = $scope.input.transform.popupLabels || returnValue;
  $scope.input.transform.popupValues = $scope.input.transform.popupValues || returnValue;
  $scope.input.transform.popupHeaders = $scope.input.transform.popupHeaders || returnValue;
  // Axis offset
  $scope.input.xAxisLabelOffset = $scope.input.xAxisLabelOffset || 0;
  // Axis culling
  $scope.input.xAxisLabelCulling = $scope.input.xAxisLabelCulling === undefined ? true : $scope.input.xAxisLabelCulling;

  $scope.settings = $scope.input;

  var updateChartOffset = {
    x: function () {
      $scope.abc.chartOffset.x = $scope.settings.margin + $scope.settings.axisTickSize * 1.5 + $scope.abc.yLongestTickText();
    },
    y: function () {
      $scope.abc.chartOffset.y = $scope.settings.margin + $scope.settings.title.size + $scope.settings.title.margin;
    },
    width: function () {
      $scope.abc.chartOffset.width = Math.max($scope.settings.width - $scope.settings.margin * 2 - $scope.settings.axisTickSize * 1.5 - $scope.abc.yLongestTickText(), 0);
    },
    height: function () {
      $scope.abc.chartOffset.height = Math.max($scope.settings.height - $scope.settings.margin * 2 - $scope.settings.title.size - $scope.settings.title.margin - $scope.settings.axisTickSize - $scope.settings.headers.size, 0);
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

  var xAxisLabelCullingUpdate = function () {
    var labels = $element.find('#abc-x-labels').children();
    var totalLabelWidth = 0;

    for (var i = 0; i < labels.length; i += 1) {
      // Multiply by 1.2 in case some labels are larger than others
      totalLabelWidth += labels[i].getComputedTextLength() * 1.2;
    }

    $scope.abc.xAxisShowEveryOther = Math.ceil(totalLabelWidth / $scope.abc.chartOffset.width);
  };

  var chartWidthUpdate = function (newValue, oldValue) {
    if (oldValue === undefined || newValue !== oldValue) {
      updateChartOffset.x();
      updateChartOffset.width();
      updateChartOffset.y();
      updateChartOffset.height();
      if ($scope.settings.xAxisLabelCulling) {
        xAxisLabelCullingUpdate();
      }
      updateYTicks();
    }
  };

  var chartHeightUpdate = function (newValue, oldValue) {
    if (oldValue === undefined || newValue !== oldValue) {
      updateChartOffset.x();
      updateChartOffset.width();
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
      if ($scope.settings.resize.width) {
        $scope.settings.width = $element.width();
      }
      if ($scope.settings.resize.height) {
        $scope.settings.height = $element.height();
      }
    }
  }, true);

  if ($scope.settings.resize.width || $scope.settings.resize.height) {
    angular.element($window).bind('resize', function () {
      $scope.$apply();
    });
  }

  $scope.abc = {
    xAxisShowEveryOther: 1,
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
          return $scope.abc.chartOffset.x;
        }
        if ($scope.settings.title.align === 'right') {
          return $scope.abc.chartOffset.x + $scope.abc.chartOffset.width;
        }
        return $scope.abc.chartOffset.x + ($scope.abc.chartOffset.width / 2);
      };
      return {
        x: getX(),
        y: $scope.settings.title.size + $scope.settings.margin
      };
    },
    verticalLineOffset: function () {
      if ($scope.settings.hovering.y < 0 && $scope.settings.hovering.x >= 0) {
        return $scope.settings.hovering.x * $scope.abc.chartOffset.width / ($scope.settings.data[0].length - 1);
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
      if ($scope.settings.title.align === 'left') {
        return 'start';
      }
      if ($scope.settings.title.align === 'right') {
        return 'end';
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
    pointRadius: function (indexP, index) {
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
      var valueLength = $scope.abc.getTextLength('#abc-popup-row-text') + $scope.abc.getTextLength('#abc-popup-value-text') + 16;
      var headerLength = $scope.abc.getTextLength('#abc-popup-column-text') + 8;
      var largerLabel = Math.max(valueLength, headerLength);

      var maxOffset = $scope.abc.chartOffset.width - 10 - largerLabel;
      var rightOffset = 0;
      if ($scope.settings.type === 'bar') {
        rightOffset = $scope.abc.hoveringBarOffset().x2 + 10;
        if (rightOffset > maxOffset) {
          return $scope.abc.calculateBarX($scope.settings.hovering.y, $scope.settings.hovering.x) - 10 - largerLabel;
        }
        return rightOffset;
      }
      rightOffset = $scope.abc.calculatePoint($scope.settings.hovering.y, $scope.settings.hovering.x).x + 10;
      if (rightOffset > maxOffset) {
        return $scope.abc.calculatePoint($scope.settings.hovering.y, $scope.settings.hovering.x).x - 10 - largerLabel;
      }
      return rightOffset;
    },
    popupRowLabel: function (index) {
      var value;
      if (index < 0) {
        return '';
      }

      value = $scope.settings.headers.rows[index].value;
      return $scope.settings.transform.popupLabels(value);
    },
    popupColumnLabel: function (index) {
      var value;
      if (index < 0) {
        return '';
      }

      value = $scope.settings.headers.columns[index].value;
      return $scope.settings.transform.popupHeaders(value);
    },
    popupValue: function (indexP, index) {
      var value;
      if (indexP < 0 || index < 0) {
        return '';
      }

      value = $scope.settings.data[indexP][index].value;
      return $scope.settings.transform.popupValues(value);
    },
    popupWidth: function () {
      var valueLength = $scope.abc.getTextLength('#abc-popup-row-text') + $scope.abc.getTextLength('#abc-popup-value-text') + 16;
      var headerLength = $scope.abc.getTextLength('#abc-popup-column-text') + 8;
      return Math.max(valueLength, headerLength) || 0;
    },
    popupValueX: function () {
      return $scope.abc.getTextLength('#abc-popup-row-text') + 8;
    },
    calculatePointYValue: function (value) {
      var multiplier = $scope.abc.chartOffset.height / $scope.abc.highLowDif();
      return $scope.abc.chartOffset.height + $scope.abc.highLow().lowest * multiplier - value * multiplier;
    },
    calculatePointXValue: function (index) {
      return $scope.abc.chartOffset.width / ($scope.settings.data[0].length - 1) * index;
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
        if (index < $scope.settings.data[indexP].length - 1) {
          final += ' C ' + $scope.abc.calculatePointXValue(index + 0.3) + ' ' + $scope.abc.calculatePoint(indexP, index).y +
          ' ' + $scope.abc.calculatePointXValue(index + 0.7) + ' ' + $scope.abc.calculatePoint(indexP, index + 1).y;
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
        x: $scope.abc.chartOffset.width / ($scope.settings.data[0].length - 1) * (index - 0.5),
        width: Math.max($scope.abc.chartOffset.width / ($scope.settings.data[0].length - 1), 0)
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
      // value = Math.round(value);
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
      var readableValue;
      var value = $scope.abc.yTickValue(index);

      if (value < 0.1 && value > -0.1) {
        if (value === 0) {
          readableValue = 0;
        } else {
          var power = $scope.abc.powerToDecimal(value);
          readableValue = value.toFixed(power.toString().length);
        }
      } else {
        readableValue = value.toFixed(2);
      }

      return $scope.settings.transform.yLabels(readableValue);
    },
    yTickOffset: function (index) {
      return $scope.abc.calculatePointYValue($scope.abc.yTickValue(index));
    },
    yTickTextLength: function (index) {
      var labels = $element.find('#abc-y-labels').children();
      if (labels.length === 0) {
        return 0;
      }
      return labels[index].getComputedTextLength();
    },
    yLongestTickText: function () {
      var labels = $element.find('#abc-y-labels').children();
      var longestFound = false;
      var longest = 0;

      for (var i = 0; i < labels.length; i += 1) {
        var textLength = labels[i].getComputedTextLength();
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
      var yPos;
      if (!region.titleY || region.titleY === 'center') {
        yPos = $scope.abc.chartOffset.height / 2 + region.size / 2;
      } else if (region.titleY === 'top') {
        yPos = region.size;
      } else if (region.titleY === 'bottom') {
        yPos = $scope.abc.chartOffset.height - region.size / 2;
      } else {
        yPos = $scope.abc.chartOffset.height * (1 - region.titleY) + region.size / 2;
      }

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
        x: $scope.abc.calculatePointXValue(start + dif / 2),
        y: yPos
      };
    },
    regionFillOpacity: function (region) {
      return region.opacity !== undefined ? region.opacity : 0.2;
    },
    getBandStart: function (band) {
      if (band.start === 'top') {
        return $scope.abc.highLow().highest;
      }
      if (band.start === 'bottom') {
        return $scope.abc.highLow().lowest;
      }
      return band.start;
    },
    getBandEnd: function (band) {
      if (band.end === 'top') {
        return $scope.abc.highLow().highest;
      }
      if (band.end === 'bottom') {
        return $scope.abc.highLow().lowest;
      }
      return band.end;
    },
    bandOffset: function (band) {
      var multiplier = $scope.abc.chartOffset.height / $scope.abc.highLowBarDif();
      var start, end;
      // Get start
      start = $scope.abc.getBandStart(band);
      // Get end
      end = $scope.abc.getBandEnd(band);
      // Swap if in wrong order (prevent negative heights)
      if (start < end) {
        var temp = start;
        start = end;
        end = temp;
      }

      var point1 = Math.min(Math.max($scope.abc.calculatePointYValue(start), 0), $scope.abc.chartOffset.height);
      var point2 = Math.max(Math.abs(start - end) * multiplier, 0);

      if (point1 + point2 > $scope.abc.chartOffset.height) {
        point2 = $scope.abc.chartOffset.height - point1;
      }

      return {
        y: point1,
        height: point2
      };
    },
    bandTitleOffset: function (band) {
      var bandOffset = $scope.abc.bandOffset(band);

      return {
        y: bandOffset.y + bandOffset.height / 2 + band.size / 2
      };
    },
    xAxisLabelOpacity: function (index) {
      if (!$scope.settings.xAxisLabelCulling) {
        return 1;
      }
      return index % $scope.abc.xAxisShowEveryOther === 0 ? 1 : 0;
    },
    yAxisLabelY: function (index) {
      return 0 - $scope.settings.axisTickSize * 1.5 - $scope.abc.yTickTextLength(index);
    }
  };

  // Set initial chart values
  updateChartOffset.x();
  updateChartOffset.y();
  updateChartOffset.width();
  updateChartOffset.height();
  updateYTicks();

}])

.directive('abcLine', [function () {
  return {
    restrict: 'E',
    replace: true,
    template:
      '<svg>' +
        '<g id="abc-lines" ng-attr-transform="translate({{abc.chartOffset.x}}, {{abc.chartOffset.y}})">' +
          '<polyline ng-class="abc.hoveringClass($index)" ng-repeat="points in settings.data" ng-attr-stroke="{{settings.colors[$index % settings.colors.length]}}" ng-attr-points="{{abc.getPoints($index)}}" ng-attr-stroke-width="{{settings.lineWidth}}" fill="none"></polyline>' +
        '</g>' +
      '</svg>'
  };
}])
.directive('abcArea', [function () {
  return {
    restrict: 'E',
    replace: true,
    template:
      '<svg>' +
        '<g id="abc-areas" ng-attr-transform="translate({{abc.chartOffset.x}}, {{abc.chartOffset.y}})">' +
          '<polyline ng-class="abc.hoveringClass($index)" ng-repeat="points in settings.data" ng-attr-stroke="{{settings.colors[$index % settings.colors.length]}}" ng-attr-fill="{{settings.colors[$index % settings.colors.length]}}" ng-attr-points="{{abc.getAreaPoints($index)}}" fill-opacity="0.3" ng-attr-stroke-width="{{settings.lineWidth}}"></polyline>' +
        '</g>' +
      '</svg>'
  };
}])
.directive('abcSpline', [function () {
  return {
    restrict: 'E',
    replace: true,
    template:
      '<svg>' +
        '<g id="abc-splines" ng-attr-transform="translate({{abc.chartOffset.x}}, {{abc.chartOffset.y}})">' +
          '<path ng-class="abc.hoveringClass($index)" ng-repeat="points in settings.data" ng-attr-stroke="{{settings.colors[$index % settings.colors.length]}}" ng-attr-d="{{abc.getSplinePoints($index)}}" ng-attr-stroke-width="{{settings.lineWidth}}" fill="none"></path>' +
        '</g>' +
      '</svg>'

  };
}])
.directive('abcBar', [function () {
  return {
    restrict: 'E',
    replace: true,
    template:
      '<svg>' +
        '<g id="abc-bars" ng-class="abc.hoveringClass($index)" ng-attr-transform="translate({{abc.chartOffset.x}}, {{abc.chartOffset.y}})" ng-repeat="points in settings.data" ng-attr-fill="{{settings.colors[$index % settings.colors.length]}}">' +
          '<rect ng-repeat="point in points" ng-attr-x="{{abc.barOffset($parent.$index, $index).x}}" ng-attr-y="{{abc.barOffset($parent.$index, $index).y}}" ng-attr-width="{{abc.barOffset($parent.$index, $index).width}}" ng-attr-height="{{abc.barOffset($parent.$index, $index).height}}"></rect>' +
        '</g>' +
      '</svg>'
  };
}]);

/* eslint-enable max-len */
