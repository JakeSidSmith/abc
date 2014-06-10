"use strict";angular.module("abcApp",["ngCookies","ngResource","ngSanitize","ngRoute"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/abc-layout.html",controller:"MainCtrl"}).otherwise({redirectTo:"/"})}]);var app=angular.module("abcApp");app.controller("MainCtrl",["$scope","ABC",function(a,b){a.types=[{name:"Line",id:"line"},{name:"Spline",id:"spline"},{name:"Area",id:"area"},{name:"Bar",id:"bar"}],a.data=[["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct"],["Group 1",0,0,0,0,0,0,0,0,0,0],["Group 2",0,0,0,0,0,0,0,0,0,0],["Group 3",0,0,0,0,0,0,0,0,0,0],["Group 4",0,0,0,0,0,0,0,0,0,0],["Group 5",0,0,0,0,0,0,0,0,0,0]],angular.forEach(a.data,function(b,c){c>0&&angular.forEach(b,function(b,d){d>0&&(a.data[c][d]=parseInt(200*(Math.random()-.5)))})}),a.hovering={x:-1,y:-1},a.colors=["#d24949","#e59648","#4f8f47","#316e93","#684c8a"],a.setHovering=function(b,c){a.hovering.x=b,a.hovering.y=c},a.clearHovering=function(){a.hovering.x=-1,a.hovering.y=-1},a.settings={resize:{width:!0,height:!1},data:b.transformData(a.data),headers:b.transformHeaders(a.data),title:{content:"My Chart",size:12,show:!0},width:700,height:250,colors:a.colors,type:"line",hovering:a.hovering,axis:{size:12,x:[],y:[]}}}]);var app=angular.module("abcApp");app.service("ABC",[function(){var a={};return a.transformData=function(a){for(var b=[],c=1;c<a.length;c+=1){b.push([]);for(var d=1;d<a[c].length;d+=1)b[c-1].push({value:a[c][d]})}return b},a.transformHeaders=function(a){for(var b={rows:[],columns:[]},c=0;c<a.length;c+=1)if(0===c)for(var d=1;d<a[c].length;d+=1)b.columns.push({value:a[c][d]});else b.rows.push({value:a[c][0]});return b},a}]),app.directive("abc",[function(){return{restrict:"AE",replace:!0,scope:{input:"=data"},templateUrl:"views/abc.html",controller:"abcController"}}]),app.controller("abcController",["$scope","$element","$window",function(a,b,c){a.input.title=a.input.title||{},a.input.title.content=a.input.title.content||"A Chart",a.input.title.size=a.input.title.size||12,a.input.title.show=a.input.title.show===!1?!1:!0,a.input.title.align=a.input.title.align||"center",a.input.title.margin=a.input.title.margin||10,a.input.hovering=a.input.hovering||{},a.input.hovering.x=a.input.hovering.x||-1,a.input.hovering.y=a.input.hovering.y||-1,a.input.type=a.input.type||"line",a.input.lineWidth=a.input.lineWidth||2,a.input.axisLineWidth=a.input.axisLineWidth||1,a.input.pointWidth=a.input.pointWidth||2.5,a.input.pointHoverWidth=a.input.pointHoverWidth||4,a.input.unit=a.input.unit||{},a.input.unit.type=a.input.unit.type||"%",a.input.unit.position=a.input.unit.position||"after",a.input.resize=a.input.resize||{},a.input.resize.width=a.input.resize.width===!1?!1:!0,a.input.resize.height=a.input.resize.height===!1?!1:!0,a.input.margin=a.input.margin||10,a.input.width=a.input.width||0,a.input.height=a.input.height||0,a.input.headers=a.input.headers||{},a.input.headers.size=a.input.headers.size||10,a.input.headers.columns=a.input.headers.columns||[],a.input.headers.rows=a.input.headers.rows||[],a.input.data=a.input.data||[],a.input.colors=a.input.colors||["#d24949","#e59648","#4f8f47","#316e93","#684c8a"],a.chartStyle={},a.chartStyle.width=a.input.resize.width===!0?"100%":"",a.chartStyle.height=a.input.resize.height===!0?"100%":"",a.getElementDimensions=function(){return{h:b.height(),w:b.width()}},a.$watch("getElementDimensions()",function(c,d){d!==c&&(a.input.width=b.width(),a.input.height=b.height())},!0),(a.input.resize.width||a.input.resize.height)&&angular.element(c).bind("resize",function(){a.$apply()}),a.settings=a.input,a.abc={axisLineSize:4,mouseOffset:{x:0,y:0},setMouseOffset:function(b){a.abc.mouseOffset.x=b.offsetX,a.abc.mouseOffset.y=b.offsetY},setHovering:function(b,c){a.settings.hovering.y=void 0!==b?b:-1,a.settings.hovering.x=void 0!==c?c:-1},chartOffset:function(){return{x:a.settings.margin,y:a.settings.margin+a.settings.title.size+a.settings.title.margin,width:Math.max(a.settings.width-2*a.settings.margin,0),height:Math.max(a.settings.height-2*a.settings.margin-a.settings.title.size-a.settings.title.margin-a.abc.axisLineSize-a.settings.headers.size,0)}},axisOffset:function(){return{x:a.settings.margin,y:a.settings.margin+a.settings.title.size+a.settings.title.margin,width:Math.max(a.settings.width-a.settings.margin,0),height:Math.max(a.settings.height-a.settings.margin-a.abc.axisLineSize-a.settings.headers.size,0)}},titleOffset:function(){var b=function(){return"left"===a.settings.title.align?a.settings.margin:"right"===a.settings.title.align?a.settings.width-a.settings.margin-a.abc.getTextLength("#abc-title"):a.settings.width/2};return{x:b(),y:a.settings.title.size+a.settings.margin}},verticalLineOffset:function(){return a.settings.hovering.y<0&&a.settings.hovering.x>=0?a.settings.hovering.x*(a.settings.width-2*a.settings.margin)/(a.settings.data[0].length-1):0},getTextLength:function(a){var c=b.find(a);return c[0].getComputedTextLength()},titleAnchor:function(){return"left"===a.settings.title.align||"right"===a.settings.title.align?a.settings.title.align:"middle"},highLow:function(){var b=!1,c=!1,d=0,e=0;return angular.forEach(a.settings.data,function(a){angular.forEach(a,function(a){(a.value<d||b===!1)&&(d=a.value,b=!0),(a.value>e||c===!1)&&(e=a.value,c=!0)})}),d===e&&(d-=1,e+=1),{lowest:d,highest:e}},highLowDif:function(){var b=a.abc.highLow();return this.difference(b.lowest,b.highest)},highLowBarDif:function(){var b=a.abc.highLow();return this.difference(Math.min(b.lowest,0),Math.max(b.highest,0))},difference:function(a,b){return Math.abs(a-b)},pointRadius:function(b,c){return a.settings.hovering.y<0?a.settings.hovering.x===c?a.settings.pointHoverWidth:a.settings.pointWidth:a.settings.hovering.y===b&&a.settings.hovering.x===c?a.settings.pointHoverWidth:a.settings.pointWidth},popupLegendX:function(){var b=a.abc.chartOffset().width-26-a.abc.getTextLength("#abc-popup-column-text")-a.abc.getTextLength("#abc-popup-value-text"),c=0;return"bar"===a.settings.type?(c=a.abc.hoveringBarOffset().x2+10,c>b?a.abc.calculateBarX(a.settings.hovering.y,a.settings.hovering.x)-26-a.abc.getTextLength("#abc-popup-column-text")-a.abc.getTextLength("#abc-popup-value-text"):c):(c=a.abc.calculatePoint(a.settings.hovering.y,a.settings.hovering.x).x+10,c>b?a.abc.calculatePoint(a.settings.hovering.y,a.settings.hovering.x).x-26-a.abc.getTextLength("#abc-popup-column-text")-a.abc.getTextLength("#abc-popup-value-text"):c)},valueInUnit:function(b,c){return 0>b||0>c?"":"before"===a.settings.unit.position?a.settings.unit.type+a.settings.data[b][c].value:a.settings.data[b][c].value+a.settings.unit.type},calculatePointYValue:function(b){var c=a.abc.chartOffset().height/a.abc.highLowDif();return a.abc.chartOffset().height+a.abc.highLow().lowest*c-b*c},calculatePointXValue:function(b){return a.abc.chartOffset().width/(a.settings.data[0].length-1)*b},calculatePoint:function(b,c){var d,e;return 0>b?{x:-10,y:-10}:(e=0>c?-10:a.abc.calculatePointYValue(a.settings.data[b][c].value),d=a.abc.calculatePointXValue(c),{x:d,y:e})},getPoints:function(b){var c=a.settings.data[b].map(function(c,d){return a.abc.calculatePoint(b,d).x+","+a.abc.calculatePoint(b,d).y}).join(",");return c},getAreaPoints:function(b){var c=a.settings.data[b].map(function(c,d){return a.abc.calculatePoint(b,d).x+","+a.abc.calculatePoint(b,d).y});return c.unshift("0,"+Math.max(Math.min(a.abc.calculatePointYValue(0),a.abc.chartOffset().height),0)),c.push(a.abc.chartOffset().width+","+Math.max(Math.min(a.abc.calculatePointYValue(0),a.abc.chartOffset().height),0)),c.join(",")},getSplinePoints:function(b){return a.settings.data[b].map(function(c,d){var e=(0===d?"M":"")+a.abc.calculatePoint(b,d).x+" "+a.abc.calculatePoint(b,d).y;return d<a.settings.data[b].length-1&&(e+=" C "+a.abc.calculatePointXValue(d+.3)+" "+a.abc.calculatePoint(b,d).y+" "+a.abc.calculatePointXValue(d+.7)+" "+a.abc.calculatePoint(b,d+1).y),e}).join(" ")},calculateBarWidth:function(){return a.abc.chartOffset().width/a.settings.data.length/a.settings.data[0].length},calculateBarY:function(b){var c=a.abc.chartOffset().height/a.abc.highLowBarDif();return a.abc.chartOffset().height-b*c+Math.min(a.abc.highLow().lowest,0)*c},calculateBarX:function(b,c){return c*a.abc.chartOffset().width/a.settings.data[0].length+b*a.abc.chartOffset().width/a.settings.data[0].length/a.settings.data.length},barOffset:function(b,c){var d=a.abc.chartOffset().height/a.abc.highLowBarDif();return a.settings.data[b][c].value<=0?{x:a.abc.calculateBarX(b,c),y:a.abc.calculateBarY(0),width:Math.max(a.abc.calculateBarWidth(b,c),0),height:Math.max(a.settings.data[b][c].value*-d,0)}:{x:a.abc.calculateBarX(b,c),y:a.abc.calculateBarY(a.settings.data[b][c].value),width:Math.max(a.abc.calculateBarWidth(b,c),0),height:Math.max(a.settings.data[b][c].value*d,0)}},hoverAreaOffset:function(b){return{x:a.abc.chartOffset().width/(a.settings.data[0].length-1)*(b-.5)+a.settings.margin,width:Math.max(a.abc.chartOffset().width/(a.settings.data[0].length-1),0)}},hoveringBarOffset:function(){if(a.settings.hovering.y<0||a.settings.hovering.x<0)return{x1:-10,y1:-10,x2:-10,y2:-10};var b=a.abc.barOffset(a.settings.hovering.y,a.settings.hovering.x);return a.settings.data[a.settings.hovering.y][a.settings.hovering.x].value>=0?{x1:b.x,y1:b.y,x2:b.x+a.abc.calculateBarWidth(),y2:b.y}:{x1:b.x,y1:b.y+b.height,x2:b.x+a.abc.calculateBarWidth(),y2:b.y+b.height}},hoveringClass:function(b){return a.settings.hovering.y>=0&&b!==a.settings.hovering.y?"not-hovering":""}}}]);